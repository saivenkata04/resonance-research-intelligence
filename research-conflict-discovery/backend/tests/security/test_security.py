import io
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from tests.fixtures.sample_papers import create_study_a_pdf, create_study_b_pdf

client = TestClient(app)


def _register_user(email_prefix: str):
    email = f"{email_prefix}_{uuid.uuid4().hex[:6]}@institute.org"
    res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "securepassword123",
        "full_name": f"Dr. {email_prefix.title()}",
        "role": "researcher"
    })
    assert res.status_code == 201
    data = res.json()
    return {
        "email": email,
        "token": data["access_token"],
        "project_id": data["user"]["project_id"],
        "headers": {"Authorization": f"Bearer {data['access_token']}"}
    }


def test_reject_unauthenticated_requests():
    """Verify that unauthenticated requests to protected endpoints fail with 401."""
    res_papers = client.get("/api/v1/papers")
    assert res_papers.status_code == 401

    res_upload = client.post("/api/v1/papers/upload", files={"file": ("test.pdf", io.BytesIO(b"%PDF-"), "application/pdf")})
    assert res_upload.status_code == 401

    res_comp = client.get("/api/v1/comparisons")
    assert res_comp.status_code == 401

    res_me = client.get("/api/v1/auth/me")
    assert res_me.status_code == 401


def test_reject_non_pdf_file():
    user = _register_user("mal_check")
    files = {"file": ("malicious.exe", io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00"), "application/x-dosexec")}
    res = client.post("/api/v1/papers/upload", files=files, headers=user["headers"])
    assert res.status_code == 400
    assert "must have a .pdf extension" in res.json()["detail"]


def test_reject_fake_pdf_magic_bytes():
    user = _register_user("magic_check")
    files = {"file": ("fake.pdf", io.BytesIO(b"NOT_A_REAL_PDF_HEADER_JUST_TEXT"), "application/pdf")}
    res = client.post("/api/v1/papers/upload", files=files, headers=user["headers"])
    assert res.status_code == 400
    assert "Invalid file signature" in res.json()["detail"]


def test_reject_cross_project_unauthorized_access():
    user = _register_user("cross_proj")
    res = client.get("/api/v1/papers?project_id=prj-unauthorized-999", headers=user["headers"])
    assert res.status_code in (403, 404)


def test_strict_multi_user_data_isolation():
    """
    Mandatory Security Requirement:
    User A uploads papers, creates comparison, and report.
    User B must NEVER be able to see, read, modify, or download User A's private assets.
    """
    # 1. Setup User A and create assets
    user_a = _register_user("user_a")
    user_b = _register_user("user_b")

    # User A uploads Study A and Study B
    pdf_a = create_study_a_pdf()
    files_a = {"file": ("paper_a.pdf", io.BytesIO(pdf_a), "application/pdf")}
    res_a = client.post("/api/v1/papers/upload", files=files_a, headers=user_a["headers"])
    assert res_a.status_code == 200
    paper_a_id = res_a.json()["id"]

    pdf_b = create_study_b_pdf()
    files_b = {"file": ("paper_b.pdf", io.BytesIO(pdf_b), "application/pdf")}
    res_b = client.post("/api/v1/papers/upload", files=files_b, headers=user_a["headers"])
    assert res_b.status_code == 200
    paper_b_id = res_b.json()["id"]

    # User A retrieves experiments & creates comparison
    exp_a_res = client.get(f"/api/v1/experiments/papers/{paper_a_id}/experiments", headers=user_a["headers"])
    exp_a_id = exp_a_res.json()[0]["id"]

    exp_b_res = client.get(f"/api/v1/experiments/papers/{paper_b_id}/experiments", headers=user_a["headers"])
    exp_b_id = exp_b_res.json()[0]["id"]

    comp_res = client.post("/api/v1/comparisons", json={
        "experiment_a_id": exp_a_id,
        "experiment_b_id": exp_b_id,
    }, headers=user_a["headers"])
    assert comp_res.status_code == 200
    comparison_a_id = comp_res.json()["id"]

    # User A generates report
    report_res = client.post(f"/api/v1/reports/comparisons/{comparison_a_id}/reports", json={"comparison_id": comparison_a_id}, headers=user_a["headers"])
    assert report_res.status_code == 200
    report_a_id = report_res.json()["id"]

    # =========================================================================
    # 2. User B Isolation Verification
    # =========================================================================

    # Check 1: User B listing papers must NOT contain User A's papers
    b_papers_res = client.get("/api/v1/papers", headers=user_b["headers"])
    assert b_papers_res.status_code == 200
    b_paper_ids = [p["id"] for p in b_papers_res.json()]
    assert paper_a_id not in b_paper_ids
    assert paper_b_id not in b_paper_ids

    # Check 2: User B direct GET on User A's paper must fail
    b_get_paper = client.get(f"/api/v1/papers/{paper_a_id}", headers=user_b["headers"])
    assert b_get_paper.status_code in (403, 404)

    # Check 3: User B direct DELETE on User A's paper must fail
    b_del_paper = client.delete(f"/api/v1/papers/{paper_a_id}", headers=user_b["headers"])
    assert b_del_paper.status_code in (403, 404)

    # Check 4: User B listing comparisons must NOT contain User A's comparison
    b_comps_res = client.get("/api/v1/comparisons", headers=user_b["headers"])
    assert b_comps_res.status_code == 200
    b_comp_ids = [c["id"] for c in b_comps_res.json()]
    assert comparison_a_id not in b_comp_ids

    # Check 5: User B direct GET on User A's comparison must fail
    b_get_comp = client.get(f"/api/v1/comparisons/{comparison_a_id}", headers=user_b["headers"])
    assert b_get_comp.status_code in (403, 404)

    # Check 6: User B direct GET on User A's comparison graph must fail
    b_get_graph = client.get(f"/api/v1/graph/{comparison_a_id}", headers=user_b["headers"])
    assert b_get_graph.status_code in (403, 404)

    # Check 7: User B direct GET on User A's root-causes must fail
    b_get_rc = client.get(f"/api/v1/root-causes/{comparison_a_id}/root-causes", headers=user_b["headers"])
    assert b_get_rc.status_code in (403, 404)

    # Check 8: User B direct GET on User A's report must fail
    b_get_rep = client.get(f"/api/v1/reports/{report_a_id}", headers=user_b["headers"])
    assert b_get_rep.status_code in (403, 404)

    # Check 9: User B downloading User A's report PDF must fail
    b_dl_rep = client.get(f"/api/v1/reports/{report_a_id}/download", headers=user_b["headers"])
    assert b_dl_rep.status_code in (403, 404)

    # Check 10: User B attempting to create comparison referencing User A's experiment must fail
    b_steal_comp = client.post("/api/v1/comparisons", json={
        "experiment_a_id": exp_a_id,
        "experiment_b_id": exp_b_id,
    }, headers=user_b["headers"])
    assert b_steal_comp.status_code in (403, 404)
