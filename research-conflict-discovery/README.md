# RESONANCE — Research Intelligence Platform

<p align="center">
  <strong>Automated Scientific Conflict Discovery, Methodological Alignment, and Root-Cause Attribution</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

---

## 🔬 Overview

**RESONANCE** is a multi-user, production-oriented research intelligence SaaS platform designed to transform scientific literature analysis from *"What do these papers say?"* into *"Why do their results disagree?"*.

When multiple research groups benchmark algorithms on identical tasks yet report contradictory performance, identifying the root cause traditionally demands tedious manual comparison of appendices, hyperparameter tables, and filtering choices. RESONANCE automates this pipeline:

1. **Ingests & Normalizes** scientific PDFs using structured scientific NLP extraction.
2. **Aligns Experimental Pipelines** into side-by-side comparison matrices across datasets, splits, architectures, and hyperparameters.
3. **Builds Topological Dependency Graphs (DAGs)** that visually trace where experimental choices diverge.
4. **Executes Deterministic Root-Cause Attribution**, separating **Observed Differences (Verified Facts)** from **Plausible Hypotheses (Literature Heuristics)**.
5. **Generates Evidence-Grounded Synthesis Reports** exportable to PDF with verbatim quotation audits and page numbers.

---

## ✨ Key Features

- **🔐 True Multi-Tenant SaaS Architecture**
  - Secure bcrypt password hashing and token-based authentication.
  - Dedicated `/register`, `/login`, and `/forgot-password` workflows.
  - Strict server-side user data isolation: each user receives their own personal project space. Users cannot access, modify, or download papers, graphs, or reports belonging to other researchers.

- **📄 Robust PDF Parsing & Extraction**
  - Pure-Python `pdfplumber` pipeline engineered for cross-platform reliability without OS DLL blocks.
  - Computes SHA-256 checksums, validates magic bytes, and guards against encrypted or malformed files.
  - Automatically extracts sections, tables, evaluation benchmarks, hyperparameters, and verbatim evidence citations.

- **📊 Contrast Matrices & Comparability Assessment**
  - Side-by-side variable comparison highlighting discrepancies in data filtering, learning rates, epochs, optimizers, and test splits.
  - Objective comparability grading: *Comparable*, *Partially Comparable*, or *Incomparable*.

- **🕸️ Interactive Pipeline Dependency Graph (DAG)**
  - Topological directed acyclic graph mapping the experimental flow:
    $$\text{Dataset} \rightarrow \text{Data Split} \rightarrow \text{Preprocessing} \rightarrow \text{Model} \rightarrow \text{Hyperparameters} \rightarrow \text{Metrics}$$
  - Dynamic node inspection linking each node directly to supporting textual evidence.

- **🔍 Methodological Attribution Engine**
  - Ranks candidate explanations for discrepancies using deterministic heuristics.
  - Strict epistemological boundary: clear separation between ground-truth observed facts and secondary literature hypotheses.

- **📑 Synthesis Reports & PDF Export**
  - Comprehensive audit reports summarizing experimental conflicts, limitations, and recommendations.
  - Backend-generated PDF downloads with cryptographic integrity verification.

---

## 🎨 Visual Identity & Design System

RESONANCE features an interface designed for scientific precision:

| Color Token | Hex | Role |
| :--- | :--- | :--- |
| **Deep Space Navy** | `#101827` | Primary header and dark shell |
| **Workspace Sidebar** | `#172235` | Navigation sidebar and card borders |
| **Electric Teal** | `#36C9C0` | Primary actions, active navigation, accents |
| **Scientific Blue** | `#3B6FD8` | Primary buttons, hero banners |
| **Canvas Background** | `#F5F7FA` | High-readability light workspace |
| **Verified Fact** | `#34D399` | Green tags for ground-truth observations |
| **Plausible Hypothesis**| `#F59E0B` | Amber badges for secondary hypotheses |
| **Divergence / Conflict**| `#EF6B73` | Coral tags for high-impact discrepancies |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) with custom design tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & API**: Centralized typed client with local storage token persistence

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12, Uvicorn, ASGI)
- **Database ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) with automatic runtime schema migrations
- **Storage**: SQLite (default local) / PostgreSQL compatible
- **Authentication**: JWT (JSON Web Tokens) with `passlib` bcrypt password hashing
- **PDF Extraction**: `pdfplumber` & `pypdf`
- **Report Generation**: `reportlab`

---

## 🚀 Getting Started

### Prerequisites
- **Python**: $\ge 3.10$ (3.12 recommended)
- **Node.js**: $\ge 18.x$
- **npm**: $\ge 9.x$

---

### 1. Run the Backend (FastAPI)

```powershell
# Navigate to the backend directory
cd backend

# Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# Run the FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Base URL**: `http://localhost:8000/api/v1`

---

### 2. Run the Frontend (Next.js)

Open a **separate terminal**:

```powershell
# Navigate to the frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

- **Web Application**: [http://localhost:3000](http://localhost:3000)

---

### 3. Default Credentials (Optional)

You can sign in with the pre-seeded account or register any new user account:

- **Email**: `researcher@resonance-intel.org`
- **Password**: `demo123`
- **Register New**: [http://localhost:3000/register](http://localhost:3000/register)

---

## 🧪 Automated Testing

The backend includes a comprehensive test suite covering unit pipelines, numerical accuracy, API integration, and multi-tenant data isolation:

```powershell
cd backend
.\.venv\Scripts\pytest -v
```

**Results: 29/29 tests passing (100%)**:
- `test_register_and_login_flow`: PASSED
- `test_strict_multi_user_data_isolation`: PASSED (10 cross-user attack vectors validated)
- `test_reject_unauthenticated_requests`: PASSED
- `test_numerical_calculations_7_4_percentage_points`: PASSED
- `test_report_source_citations_and_verbatim_grounding`: PASSED
- `test_pdf_report_export_byte_integrity`: PASSED

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
