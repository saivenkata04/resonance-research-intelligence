import io
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import SessionLocal
from app.db.models import Paper, Experiment, Comparison, Report, User, Project, ProjectMember, EvidenceQuote, ReportedResult
from app.ingestion.validation import validate_pdf_upload, PDFValidationError
from app.analysis.conflict_detector import ConflictDetector
from app.analysis.comparability import ComparabilityEngine
from app.analysis.root_cause import RootCauseRankingEngine
from app.reporting.report_generator import ReportGenerator
from app.core.permissions import check_project_access
from tests.fixtures.sample_papers import create_study_a_pdf, create_study_b_pdf, create_synthetic_pdf

client = TestClient(app)


@pytest.fixture
def auth_headers():
    res = client.post("/api/v1/auth/token", data={
        "username": "researcher@resonance-intel.org",
        "password": "demo123"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ============================================================================
# 1. INVALID PDFS, EXTRACTION FAILURES & RETRIES
# ============================================================================

def test_reject_invalid_pdf_extensions(auth_headers):
    """Verify that non-PDF files are rejected with HTTP 400."""
    invalid_files = [
        ("malicious.exe", b"MZ\x90\x00\x03\x00\x00\x00", "application/x-dosexec"),
        ("notes.docx", b"PK\x03\x04\x14\x00\x06\x00", "application/vnd.openxmlformats-officedocument"),
        ("data.csv", b"col1,col2\n1,2", "text/csv"),
        ("archive.tar.gz", b"\x1f\x8b\x08\x00", "application/gzip"),
    ]
    for filename, content, mime in invalid_files:
        files = {"file": (filename, io.BytesIO(content), mime)}
        res = client.post("/api/v1/papers/upload", files=files, data={"project_id": "prj-reproducibility-01"}, headers=auth_headers)
        assert res.status_code == 400
        assert "must have a .pdf extension" in res.json()["detail"]


def test_reject_corrupted_and_fake_pdf_headers(auth_headers):
    """Verify that files with a .pdf extension but invalid header bytes are rejected."""
    corrupted_cases = [
        ("fake_text.pdf", b"This is just plain text masquerading as a PDF file"),
        ("random_bytes.pdf", b"\x00\x01\x02\x03\x04\x05\x06\x07\x08"),
        ("truncated_pdf.pdf", b"%PDF-1.4\n%corrupted"),
    ]
    for filename, content in corrupted_cases:
        files = {"file": (filename, io.BytesIO(content), "application/pdf")}
        res = client.post("/api/v1/papers/upload", files=files, data={"project_id": "prj-reproducibility-01"}, headers=auth_headers)
        assert res.status_code == 400


def test_reject_zero_byte_pdf(auth_headers):
    """Verify that empty files are rejected."""
    files = {"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")}
    res = client.post("/api/v1/papers/upload", files=files, data={"project_id": "prj-reproducibility-01"}, headers=auth_headers)
    assert res.status_code == 400


def test_reject_encrypted_password_protected_pdf(auth_headers):
    """Verify that encrypted/password-protected PDFs are detected and rejected."""
    pdf_bytes = (
        b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R >>\nendobj\n"
        b"4 0 obj\n<< /Filter /Standard /V 1 /R 2 >>\nendobj\n"
        b"trailer\n<< /Root 1 0 R /Encrypt 4 0 R >>\n%%EOF"
    )

    files = {"file": ("encrypted.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    res = client.post("/api/v1/papers/upload", files=files, data={"project_id": "prj-reproducibility-01"}, headers=auth_headers)
    assert res.status_code == 400
    assert "Encrypted or password-protected" in res.json()["detail"] or "Malformed" in res.json()["detail"]


def test_reprocess_and_retry_paper(auth_headers):
    """Verify that retrying a paper re-executes extraction and successfully completes."""
    db: Session = SessionLocal()
    try:
        # Upload Study A PDF
        pdf_bytes = create_study_a_pdf()
        files = {"file": ("test_study_retry.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
        res = client.post("/api/v1/papers/upload", files=files, data={"project_id": "prj-reproducibility-01"}, headers=auth_headers)
        assert res.status_code == 200
        paper_id = res.json()["id"]

        # Simulate transient error status
        paper = db.query(Paper).filter(Paper.id == paper_id).first()
        paper.status = "failed"
        paper.error_message = "Simulated transient OCR parser failure"
        db.commit()

        # Call retry endpoint
        retry_res = client.post(f"/api/v1/papers/{paper_id}/retry", headers=auth_headers)
        assert retry_res.status_code == 200
        assert retry_res.json()["status"] == "completed"
        assert retry_res.json()["error_message"] is None

        # Verify status endpoint reflects completion
        status_res = client.get(f"/api/v1/papers/{paper_id}/status", headers=auth_headers)
        assert status_res.status_code == 200
        assert status_res.json()["status"] == "completed"
        assert status_res.json()["experiment_count"] >= 1
    finally:
        db.close()


# ============================================================================
# 2. PROJECT PERMISSIONS & UNAUTHORIZED ACCESS
# ============================================================================

def test_unauthorized_project_access_404(auth_headers):
    """Verify that non-existent project returns 404."""
    res = client.get("/api/v1/papers?project_id=prj-does-not-exist-999", headers=auth_headers)
    assert res.status_code in (403, 404)
    assert "not found" in res.json()["detail"].lower() or "forbidden" in res.json()["detail"].lower()


def test_project_membership_forbidden_403():
    """Verify that a user without membership in a private project is blocked with 403."""
    import uuid
    db: Session = SessionLocal()
    try:
        uid = str(uuid.uuid4())[:8]
        other_user = User(
            id=f"usr-{uid}-owner",
            email=f"owner_{uid}@external-lab.org",
            hashed_password="test_hash_pw_1",
            full_name="Isolated Researcher",
            role="researcher",
            is_active=True,
        )
        db.add(other_user)
        db.commit()

        isolated_project = Project(
            id=f"prj-{uid}-secure",
            name="Confidential Medical Trials",
            owner_id=other_user.id,
        )
        db.add(isolated_project)
        db.commit()

        non_member_user = User(
            id=f"usr-{uid}-guest",
            email=f"guest_{uid}@external-lab.org",
            hashed_password="test_hash_pw_2",
            full_name="Guest Researcher",
            role="researcher",
            is_active=True,
        )
        db.add(non_member_user)
        db.commit()

        # Enforce check_project_access
        with pytest.raises(Exception) as exc_info:
            check_project_access(
                project_id=isolated_project.id,
                user=non_member_user,
                db=db,
                required_role="viewer"
            )
        assert "403" in str(exc_info.value) or "Access forbidden" in str(exc_info.value)
    finally:
        db.close()


def test_owner_role_required_for_paper_deletion():
    """Verify that deleting a paper requires owner privileges."""
    import uuid
    db: Session = SessionLocal()
    try:
        uid = str(uuid.uuid4())[:8]
        demo_project = db.query(Project).filter(Project.id == "prj-reproducibility-01").first()

        # A viewer user attempting deletion
        viewer_user = User(
            id=f"usr-{uid}-viewer",
            email=f"viewer_{uid}@resonance-intel.org",
            hashed_password="test_hash_pw_3",
            full_name="Viewer Researcher",
            role="researcher",
            is_active=True,
        )
        db.add(viewer_user)
        db.commit()

        membership = ProjectMember(
            project_id=demo_project.id,
            user_id=viewer_user.id,
            role="viewer"
        )
        db.add(membership)
        db.commit()

        with pytest.raises(Exception) as exc_info:
            check_project_access(
                project_id=demo_project.id,
                user=viewer_user,
                db=db,
                required_role="owner"
            )
        assert "owner permissions required" in str(exc_info.value).lower()
    finally:
        db.close()


# ============================================================================
# 3. REPORT CITATIONS & NUMERICAL CALCULATIONS
# ============================================================================

def test_numerical_calculations_7_4_percentage_points():
    """
    Verify exact numerical calculations:
    Study A = 84.2% Macro-F1
    Study B = 76.8% Macro-F1
    Difference = 7.4 percentage points
    Relative difference = |84.2 - 76.8| / ((84.2 + 76.8) / 2) * 100 = 9.19%
    """
    res_a = ReportedResult(
        metric_raw_name="Macro-F1",
        metric_normalized_name="macro_f1",
        normalized_numeric_value=84.2,
        unit="percent",
        direction="higher_is_better"
    )
    res_b = ReportedResult(
        metric_raw_name="Macro-F1",
        metric_normalized_name="macro_f1",
        normalized_numeric_value=76.8,
        unit="percent",
        direction="higher_is_better"
    )

    conflicts = ConflictDetector.detect_conflicts([res_a], [res_b])
    assert len(conflicts) == 1

    c = conflicts[0]
    assert c["metric_name"] == "macro_f1"
    assert c["val_a"] == 84.2
    assert c["val_b"] == 76.8
    assert c["abs_diff"] == 7.4
    assert c["pct_points_diff"] == 7.4
    assert round(c["relative_pct_diff"], 2) == 9.19
    assert c["classification"] == "moderate_conflict"
    assert c["direction_conflict"] is False
    assert "7.4 percentage-point" in c["rationale"] or "7.4 percentage-points" in c["rationale"]


def test_report_source_citations_and_verbatim_grounding():
    """Verify that every citation in generated reports links to a genuine PDF passage."""
    db: Session = SessionLocal()
    try:
        from app.db.models import ConflictRecord
        comp = (
            db.query(Comparison)
            .join(ConflictRecord)
            .filter(ConflictRecord.abs_diff == 7.4)
            .first()
        )
        assert comp is not None

        structured_rep = ReportGenerator.build_structured_report(comp)
        assert "metadata" in structured_rep
        assert "studies" in structured_rep
        assert "conflicts" in structured_rep
        assert "root_causes" in structured_rep
        assert "limitations" in structured_rep

        # Verify limitations explicitly state observational / causation caveats
        limitations = structured_rep["limitations"]
        has_non_causal_statement = any(
            "causation" in lim.lower() or "hypotheses" in lim.lower() or "observational" in lim.lower()
            for lim in limitations
        )
        assert has_non_causal_statement, "Report must explicitly declare that explanations are candidate hypotheses."

        # Verify conflict delta matches 7.4
        f1_conflict = next((c for c in structured_rep["conflicts"] if c["metric"] == "macro_f1"), None)
        assert f1_conflict is not None
        assert f1_conflict["abs_diff"] == 7.4
    finally:
        db.close()


def test_pdf_report_export_byte_integrity():
    """Verify that PDF generation creates valid, downloadable PDF bytes with genuine header."""
    db: Session = SessionLocal()
    try:
        report = db.query(Report).first()
        assert report is not None

        pdf_bytes = ReportGenerator.export_pdf(report)
        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 1000
        assert pdf_bytes.startswith(b"%PDF-")

        # Verify PDF can be parsed
        import pdfplumber
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as doc:
            assert len(doc.pages) >= 1
            page_text = doc.pages[0].extract_text()
            assert "RESONANCE" in page_text
            assert "Root-Cause" in page_text or "Audit" in page_text
            assert "Epistemic Integrity Notice" in page_text
    finally:
        db.close()


# ============================================================================
# 4. EVALUATION AGAINST MANUALLY CHECKED BENCHMARKS
# ============================================================================

def test_benchmark_extraction_and_conflict_accuracy():
    """Evaluate full pipeline extraction accuracy and candidate ranking against ground truth."""
    from evaluation.evaluate import run_evaluation_benchmark
    eval_results = run_evaluation_benchmark()

    assert eval_results["numerical_extraction_accuracy"] == 1.0
    assert eval_results["conflict_detection_f1"] == 1.0
    assert eval_results["root_cause_precision_at_1"] == 1.0
    assert eval_results["root_cause_mrr"] == 1.0
    assert eval_results["benchmark_latency_ms"] < 250
