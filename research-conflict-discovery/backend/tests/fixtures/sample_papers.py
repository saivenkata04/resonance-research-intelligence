import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def create_synthetic_pdf(title: str, abstract: str, body: str) -> bytes:
    """Create a genuine, valid PDF document in-memory using ReportLab."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    
    # Title
    c.setFont("Helvetica-Bold", 15)
    c.drawString(50, 740, title)
    
    # Abstract Section
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, 700, "Abstract")
    c.setFont("Helvetica", 10)
    
    # Simple word wrap for abstract lines
    y = 680
    for line in abstract.split(". "):
        if line.strip():
            c.drawString(50, y, line.strip() + ".")
            y -= 15

    # Methodology & Experiments Section
    y -= 15
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Methodology and Experiments")
    y -= 20
    c.setFont("Helvetica", 10)
    for paragraph in body.split("\n"):
        if not paragraph.strip():
            y -= 10
            continue
        c.drawString(50, y, paragraph.strip())
        y -= 15

    c.showPage()
    c.save()
    buf.seek(0)
    return buf.getvalue()


def create_study_a_pdf() -> bytes:
    title = "Robust Transfer Learning on SQuAD-v2 with RoBERTa"
    abstract = (
        "We evaluate zero-shot question answering robustness using RoBERTa-large on SQuAD-v2. "
        "Our methodology achieves strong out-of-domain transfer performance."
    )
    body = (
        "4. Experimental Protocol and Dataset Filtering\n"
        "To eliminate degenerate short queries, sentences with fewer than 15 tokens were omitted from the final evaluation pool. "
        "We configure learning rate lr=2e-5 with batch size 32 using adamw optimizer for 3 epochs.\n\n"
        "5. Empirical Results\n"
        "Our evaluated framework reached Macro-F1 of 84.2% ± 0.4% across filtered test targets."
    )
    return create_synthetic_pdf(title, abstract, body)


def create_study_b_pdf() -> bytes:
    title = "Limitations of Transfer Under Distribution Drift in QA"
    abstract = (
        "We investigate failure modes of zero-shot question answering using RoBERTa-large on SQuAD-v2. "
        "We report significant performance degradation under raw corpus evaluation."
    )
    body = (
        "4. Experimental Protocol\n"
        "We evaluate across the comprehensive uncurated corpus without post-hoc length filtering. "
        "We configure learning rate lr=3e-5 with batch size 32 using adamw optimizer for 3 epochs.\n\n"
        "5. Empirical Results\n"
        "Under strict evaluation conditions, the framework demonstrates brittle generalization reaching Macro-F1 of 76.8% ± 0.5%."
    )
    return create_synthetic_pdf(title, abstract, body)
