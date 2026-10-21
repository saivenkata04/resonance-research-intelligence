# RESONANCE Backend — Research Intelligence

RESONANCE is a Scientific Research Conflict Analysis and Root-Cause Discovery System. It accepts peer-reviewed research PDF manuscripts, extracts structured experimental attributes, normalizes methodologies, identifies conflicting reported findings, ranks plausible explanations for those conflicts, and generates evidence-backed reports with verifiable page citations.

---

## 1. Architecture Overview

- **REST API Framework**: FastAPI with Pydantic v2 typed contracts and OpenAPI documentation.
- **Database Layer**: SQLAlchemy 2.x ORM supporting SQLite (default development) and PostgreSQL (production).
- **PDF Extraction Engine**: PyMuPDF (`fitz`) for text/block extraction and `pdfplumber` for tabular evaluation matrices.
- **Scientific Extraction**: Rule-based regex and scientific terminology normalizers without proprietary LLM lock-in.
- **Comparability Engine**: Evaluates task, dataset, model, and split alignment into `comparable`, `partially_comparable`, or `not_comparable`.
- **Conflict Detection Engine**: Identifies numerical, directional, and statistical variance discrepancies across reported metrics.
- **Root-Cause Ranking Engine**: Interpretable, deterministic heuristics ranking plausible factors (dataset drift, preprocessing variation, hyperparameter divergence, metric semantics).
- **Dependency Graph**: NetworkX directed acyclic graph serialized for React Flow frontend rendering.
- **Reporting Engine**: Synthesizes structured JSON and downloadable audit PDFs via ReportLab.
- **Asynchronous Pipeline**: Celery and Redis worker architecture for long-running batch ingestion.

---

## 2. Local Setup & Quickstart (Windows & VS Code)

### Prerequisites
- Python 3.12+ (Installed in `.venv`)
- Windows PowerShell

### Step 1: Activate Virtual Environment
```powershell
cd research-conflict-discovery/backend
.\.venv\Scripts\Activate.ps1
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```

### Step 3: Initialize Database
```powershell
.\.venv\Scripts\python.exe -m app.db.init_db
```
This generates the database schema and seeds the default research project (`prj-reproducibility-01`) and demo auditor user (`researcher@resonance-intel.org`).

### Step 4: Run FastAPI Server
```powershell
.\.venv\Scripts\uvicorn.exe app.main:app --reload --host 127.0.0.1 --port 8000
```
Interactive API docs are available at:
- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`
- Health check: `http://localhost:8000/health`

---

## 3. Running Automated Tests

Run the complete test suite (Unit, Integration, Security):
```powershell
.\.venv\Scripts\pytest.exe -v
```

Run specific test modules:
```powershell
# Unit tests
.\.venv\Scripts\pytest.exe tests/unit/test_scientific_pipeline.py -v

# API integration tests
.\.venv\Scripts\pytest.exe tests/integration/test_api_integration.py -v

# Security and validation tests
.\.venv\Scripts\pytest.exe tests/security/test_security.py -v
```

---

## 4. Running the Evaluation Benchmark

Execute the scientific accuracy and ranking benchmark runner:
```powershell
.\.venv\Scripts\python.exe -m evaluation.evaluate
```

Benchmark metrics tracked:
- Numerical Extraction Accuracy
- Conflict Detection F1
- Root-Cause Precision@1 and Mean Reciprocal Rank (MRR)
- Evidence Traceability Rate
- Processing Latency

---

## 5. Docker Orchestration

To run the complete ecosystem (PostgreSQL, Redis, Backend API, Celery Worker, Frontend):
```bash
docker-compose up --build
```
