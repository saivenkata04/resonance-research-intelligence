import io
import pytest
import pdfplumber
from app.ingestion.validation import PDFDocWrapper
from tests.fixtures.sample_papers import create_study_a_pdf, create_study_b_pdf
from app.extraction.pdf_parser import PDFParser
from app.extraction.section_parser import SectionParser
from app.extraction.scientific_nlp import ScientificNLPExtractor
from app.normalization.datasets import normalize_dataset_name
from app.normalization.models import normalize_model_architecture
from app.normalization.metrics import normalize_metric_name
from app.normalization.units import normalize_numeric_value
from app.analysis.comparability import ComparabilityEngine
from app.analysis.conflict_detector import ConflictDetector
from app.analysis.root_cause import RootCauseRankingEngine
from app.db.models import Experiment, ReportedResult, EvidenceQuote


def test_pdf_parsing_and_section_extraction():
    pdf_bytes = create_study_a_pdf()
    raw = pdfplumber.open(io.BytesIO(pdf_bytes))
    doc = PDFDocWrapper(raw, is_plumber=True)
    parsed = PDFParser.parse_pdf(doc)

    assert parsed["page_count"] == 1
    assert parsed["ocr_required"] is False
    assert "Robust Transfer Learning" in parsed["title_candidate"]

    sections = SectionParser.parse_sections(parsed["pages"])
    assert len(sections) >= 1
    doc.close()


def test_scientific_nlp_extraction():
    text = (
        "We evaluate on Question Answering using learning rate lr=2e-5, batch size 32, "
        "and adamw optimizer. We filtered sentences < 15 tokens. Reached Macro-F1 of 84.2% ± 0.4%."
    )

    task = ScientificNLPExtractor.extract_task(text)
    assert task == "Question Answering"

    hp = ScientificNLPExtractor.extract_hyperparameters(text)
    assert hp.get("learning_rate") == "2e-5"
    assert hp.get("batch_size") == "32"
    assert hp.get("optimizer") == "adamw"

    results = ScientificNLPExtractor.extract_results_from_text(text, page_number=1)
    assert len(results) >= 1
    assert "Macro-F1" in results[0]["metric_raw"]
    assert "84.2%" in results[0]["value_raw"]


def test_normalization_modules():
    # Dataset Normalization
    canon_ds, raw_ds = normalize_dataset_name("Evaluated on SQuAD v2.0 benchmark")
    assert canon_ds == "squad_v2"

    # Model Architecture Normalization
    canon_model, raw_model = normalize_model_architecture("Fine-tuned RoBERTa-large checkpoint")
    assert canon_model == "roberta_large"

    # Metric Normalization
    canon_metric, unit, direction = normalize_metric_name("Macro-F1 score")
    assert canon_metric == "macro_f1"
    assert direction == "higher_is_better"

    # Unit Normalization
    val_percent, _ = normalize_numeric_value("0.842", "percent")
    assert val_percent == 84.2


def test_comparability_assessment():
    exp_a = Experiment(
        id="exp-1",
        task="Question Answering",
        dataset_normalized="squad_v2",
        dataset_name="SQuAD-v2",
        model_normalized="roberta_large",
        model_architecture="RoBERTa-large",
        preprocessing="Filtered length > 15 tokens",
        test_split="test",
    )
    exp_b = Experiment(
        id="exp-2",
        task="Question Answering",
        dataset_normalized="squad_v2",
        dataset_name="SQuAD-v2",
        model_normalized="roberta_large",
        model_architecture="RoBERTa-large",
        preprocessing="Unfiltered raw test split",
        test_split="test",
    )

    assessment = ComparabilityEngine.assess_comparability(exp_a, exp_b)
    assert assessment["status"] == "partially_comparable"
    assert any(d["attribute"] == "preprocessing" for d in assessment["differing_attributes"])


def test_conflict_detection_and_classification():
    res_a = ReportedResult(
        metric_raw_name="Macro-F1",
        metric_normalized_name="macro_f1",
        raw_value_str="84.2%",
        normalized_numeric_value=84.2,
        unit="percent",
        direction="higher_is_better",
        uncertainty_numeric=0.4,
    )
    res_b = ReportedResult(
        metric_raw_name="Macro-F1",
        metric_normalized_name="macro_f1",
        raw_value_str="76.8%",
        normalized_numeric_value=76.8,
        unit="percent",
        direction="higher_is_better",
        uncertainty_numeric=0.5,
    )

    conflicts = ConflictDetector.detect_conflicts([res_a], [res_b])
    assert len(conflicts) == 1
    conf = conflicts[0]
    assert conf["abs_diff"] == 7.4
    assert conf["pct_points_diff"] == 7.4
    assert conf["classification"] == "moderate_conflict"


def test_root_cause_ranking_heuristics():
    exp_a = Experiment(
        id="exp-1",
        task="Question Answering",
        dataset_normalized="squad_v2",
        model_normalized="roberta_large",
        preprocessing="Filtered sentences < 15 words",
        dataset_distribution="Filtered",
        hyperparameters={"learning_rate": "2e-5"},
    )
    exp_b = Experiment(
        id="exp-2",
        task="Question Answering",
        dataset_normalized="squad_v2",
        model_normalized="roberta_large",
        preprocessing="Unfiltered test split",
        dataset_distribution="Raw",
        hyperparameters={"learning_rate": "3e-5"},
    )

    conflicts = [{"classification": "severe_conflict", "metric_name": "macro_f1"}]
    quote_a = EvidenceQuote(id="q1", exact_quote="Filtered queries < 15 words")
    quote_b = EvidenceQuote(id="q2", exact_quote="Full uncurated test split")

    candidates = RootCauseRankingEngine.rank_candidates(
        exp_a, exp_b, conflicts, [quote_a], [quote_b]
    )

    assert len(candidates) >= 1
    # Dataset drift should rank #1 due to length filtering discrepancy
    assert candidates[0]["factor_category"] == "dataset_drift"
    assert candidates[0]["plausibility_score"] >= 0.90
    assert candidates[0]["rank_order"] == 1
