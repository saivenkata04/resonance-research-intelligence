import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from tests.fixtures.sample_papers import create_study_a_pdf, create_study_b_pdf

client = TestClient(app)


def test_health_and_readiness_endpoints():
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    res_ready = client.get("/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["status"] == "ready"


def test_register_and_login_flow():
    import uuid
    random_email = f"user_{uuid.uuid4().hex[:8]}@oxford.ac.uk"
    payload = {
        "email": random_email,
        "password": "securepassword123",
        "full_name": "Dr. Integration Tester",
        "role": "researcher"
    }
    res_reg = client.post("/api/v1/auth/register", json=payload)
    assert res_reg.status_code == 201
    data = res_reg.json()
    assert "access_token" in data
    assert data["user"]["email"] == random_email

    # Test login with newly registered credentials
    login_data = {
        "username": random_email,
        "password": "securepassword123"
    }
    res_login = client.post("/api/v1/auth/token", data=login_data)
    assert res_login.status_code == 200
    login_json = res_login.json()
    assert "access_token" in login_json
    assert login_json["user"]["email"] == random_email


def test_full_cross_paper_analysis_workflow():
    # 0. Register and authenticate a dedicated workflow researcher
    import uuid
    email = f"workflow_{uuid.uuid4().hex[:6]}@cam.ac.uk"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "securepassword123",
        "full_name": "Dr. Workflow Auditor",
        "role": "researcher"
    })
    assert reg_res.status_code == 201
    auth_data = reg_res.json()
    token = auth_data["access_token"]
    user_project_id = auth_data["user"]["project_id"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Upload Study A PDF
    pdf_a_bytes = create_study_a_pdf()
    files_a = {"file": ("study_a.pdf", io.BytesIO(pdf_a_bytes), "application/pdf")}
    res_a = client.post("/api/v1/papers/upload", files=files_a, data={"project_id": user_project_id}, headers=headers)
    assert res_a.status_code == 200
    paper_a_data = res_a.json()
    paper_a_id = paper_a_data["id"]

    # 2. Upload Study B PDF
    pdf_b_bytes = create_study_b_pdf()
    files_b = {"file": ("study_b.pdf", io.BytesIO(pdf_b_bytes), "application/pdf")}
    res_b = client.post("/api/v1/papers/upload", files=files_b, data={"project_id": user_project_id}, headers=headers)
    assert res_b.status_code == 200
    paper_b_data = res_b.json()
    paper_b_id = paper_b_data["id"]

    # 3. Retrieve Experiments
    res_exp_a = client.get(f"/api/v1/experiments/papers/{paper_a_id}/experiments", headers=headers)
    assert res_exp_a.status_code == 200
    exp_a_list = res_exp_a.json()
    assert len(exp_a_list) >= 1
    exp_a_id = exp_a_list[0]["id"]

    res_exp_b = client.get(f"/api/v1/experiments/papers/{paper_b_id}/experiments", headers=headers)
    assert res_exp_b.status_code == 200
    exp_b_list = res_exp_b.json()
    assert len(exp_b_list) >= 1
    exp_b_id = exp_b_list[0]["id"]

    # 4. Create Comparison
    comp_payload = {
        "project_id": user_project_id,
        "experiment_a_id": exp_a_id,
        "experiment_b_id": exp_b_id,
    }
    res_comp = client.post("/api/v1/comparisons", json=comp_payload, headers=headers)
    assert res_comp.status_code == 200
    comp_data = res_comp.json()
    comparison_id = comp_data["id"]
    assert len(comp_data["conflicts"]) >= 1
    assert len(comp_data["root_causes"]) >= 1

    # 5. Retrieve Dependency Graph
    res_graph = client.get(f"/api/v1/graph/comparisons/{comparison_id}/graph", headers=headers)
    assert res_graph.status_code == 200
    graph_data = res_graph.json()
    assert "nodes" in graph_data
    assert "edges" in graph_data

    # 6. Generate Report
    res_report = client.post(f"/api/v1/reports/comparisons/{comparison_id}/reports", json={"comparison_id": comparison_id}, headers=headers)
    assert res_report.status_code == 200
    report_data = res_report.json()
    report_id = report_data["id"]

    # 7. Download PDF
    res_pdf = client.get(f"/api/v1/reports/{report_id}/download", headers=headers)
    assert res_pdf.status_code == 200
    assert res_pdf.headers["content-type"] == "application/pdf"
    assert len(res_pdf.content) > 1000
