import io
from datetime import datetime
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.db.models import Comparison, Report


class ReportGenerator:
    """Generates structured evidence reports and exportable PDF audit documents."""

    @staticmethod
    def build_structured_report(comparison: Comparison) -> Dict[str, Any]:
        exp_a = comparison.experiment_a
        exp_b = comparison.experiment_b

        conflicts_list = [
            {
                "metric": c.metric_name,
                "val_a": c.val_a,
                "val_b": c.val_b,
                "abs_diff": c.abs_diff,
                "classification": c.classification,
                "rationale": c.rationale,
            }
            for c in comparison.conflicts
        ]

        root_causes_list = [
            {
                "rank": rc.rank_order,
                "category": rc.factor_category,
                "plausibility_score": rc.plausibility_score,
                "explanation": rc.explanation,
                "missing_information": rc.missing_information,
            }
            for rc in comparison.root_causes
        ]

        return {
            "metadata": {
                "system": "RESONANCE — Research Intelligence",
                "analysis_version": comparison.analysis_version,
                "generated_at": datetime.utcnow().isoformat(),
            },
            "studies": {
                "study_a": {
                    "id": exp_a.id,
                    "paper_id": exp_a.paper_id,
                    "model": exp_a.model_architecture,
                    "dataset": exp_a.dataset_name,
                    "preprocessing": exp_a.preprocessing,
                },
                "study_b": {
                    "id": exp_b.id,
                    "paper_id": exp_b.paper_id,
                    "model": exp_b.model_architecture,
                    "dataset": exp_b.dataset_name,
                    "preprocessing": exp_b.preprocessing,
                },
            },
            "comparability": {
                "status": comparison.comparability_status,
                "rationale": comparison.comparability_rationale,
                "attribute_differences": comparison.attribute_differences,
            },
            "conflicts": conflicts_list,
            "root_causes": root_causes_list,
            "limitations": [
                "Observational analysis: candidate explanations are ranked hypotheses.",
                "Empirical causation requires controlled benchmark ablation runs.",
            ],
        }

    @staticmethod
    def export_pdf(report: Report) -> bytes:
        """Render downloadable PDF audit report with ReportLab."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#101827"),
            fontName="Helvetica-Bold",
        )

        heading_style = ParagraphStyle(
            "Heading2",
            parent=styles["Heading2"],
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#3B6FD8"),
            fontName="Helvetica-Bold",
        )

        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#334155"),
        )

        elements = []

        # Header
        elements.append(Paragraph("RESONANCE — Research Conflict & Root-Cause Audit Report", title_style))
        elements.append(Paragraph(f"Report ID: {report.id} • Generated: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S UTC')}", body_style))
        elements.append(Spacer(1, 14))

        # Executive Summary
        elements.append(Paragraph("Executive Summary", heading_style))
        elements.append(Paragraph(report.summary, body_style))
        elements.append(Spacer(1, 12))

        # Discrepancy Matrix
        elements.append(Paragraph("Conflict & Discrepancy Findings", heading_style))
        conflicts = report.structured_content.get("conflicts", [])
        if conflicts:
            table_data = [["Metric", "Study A", "Study B", "Delta", "Classification"]]
            for c in conflicts:
                table_data.append([
                    c.get("metric", ""),
                    str(c.get("val_a", "")),
                    str(c.get("val_b", "")),
                    f"{c.get('abs_diff', '')}%",
                    c.get("classification", "").replace("_", " ").title(),
                ])
            t = Table(table_data, colWidths=[110, 75, 75, 75, 180])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#101827")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DCE4EE")),
            ]))
            elements.append(t)
            elements.append(Spacer(1, 14))

        # Ranked Root Causes
        elements.append(Paragraph("Ranked Root-Cause Explanations", heading_style))
        root_causes = report.structured_content.get("root_causes", [])
        for rc in root_causes:
            rc_title = f"Rank {rc.get('rank')} — {rc.get('category', '').replace('_', ' ').title()} (Plausibility: {int(rc.get('plausibility_score', 0) * 100)}%)"
            elements.append(Paragraph(rc_title, ParagraphStyle("RC_Title", parent=body_style, fontName="Helvetica-Bold", textColor=colors.HexColor("#101827"))))
            elements.append(Paragraph(rc.get("explanation", ""), body_style))
            elements.append(Spacer(1, 6))

        # Scientific Epistemic Disclaimer
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("Epistemic Integrity Notice", ParagraphStyle("NoticeTitle", parent=body_style, fontName="Helvetica-Bold", textColor=colors.HexColor("#991B1B"))))
        elements.append(Paragraph("This synthesis is derived through structured NLP extraction from published scientific text. Explanations represent plausible ranked hypotheses and do not constitute formal empirical proof of causation without controlled experimental replication.", body_style))

        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
