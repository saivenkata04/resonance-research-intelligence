import io
import os
import pytest
import pdfplumber
from app.ingestion.validation import PDFDocWrapper
from app.extraction.pdf_parser import PDFParser
from app.extraction.section_parser import SectionParser
from app.extraction.scientific_nlp import ScientificNLPExtractor
from app.normalization.datasets import normalize_dataset_name
from app.normalization.models import normalize_model_architecture
from tests.fixtures.sample_papers import create_study_a_pdf, create_study_b_pdf


def test_pdf_pipeline_study_a():
    """Validates the PDF pipeline extraction on resonance_sample_paper_A.pdf."""
    pdf_bytes = create_study_a_pdf()
    raw = pdfplumber.open(io.BytesIO(pdf_bytes))
    doc = PDFDocWrapper(raw, is_plumber=True)
    parsed = PDFParser.parse_pdf(doc)
    doc.close()
    sections = SectionParser.parse_sections(parsed["pages"])
    all_text = " ".join(s["raw_text"] for s in sections)

    # 1. Dataset Extraction
    dataset_canon, dataset_raw = normalize_dataset_name(all_text)
    assert dataset_canon == "squad_v2", f"Expected squad_v2, got {dataset_canon}"
    assert "SQuAD-v2" in dataset_raw

    # 2. Model Extraction
    model_canon, model_raw = normalize_model_architecture(all_text)
    assert model_canon == "roberta_large", f"Expected roberta_large, got {model_canon}"
    assert "RoBERTa-large" in model_raw

    # 3. Hyperparameters Extraction
    hp = ScientificNLPExtractor.extract_hyperparameters(all_text)
    assert hp.get("learning_rate") == "2e-5", f"Expected lr 2e-5, got {hp.get('learning_rate')}"
    assert hp.get("batch_size") == "32", f"Expected batch size 32, got {hp.get('batch_size')}"
    assert hp.get("optimizer") == "adamw", f"Expected optimizer adamw, got {hp.get('optimizer')}"
    assert hp.get("epochs") == "3", f"Expected epochs 3, got {hp.get('epochs')}"

    # 4. Preprocessing & Split Extraction
    prep = ScientificNLPExtractor.extract_preprocessing_snippets(all_text)
    assert any("15 tokens" in p or "filter" in p.lower() for p in prep)

    # 5. Numerical Accuracy / Results Extraction
    results = ScientificNLPExtractor.extract_results_from_text(all_text, 1)
    assert len(results) >= 1
    assert results[0]["metric_raw"] == "Macro-F1"
    assert "84.2" in results[0]["value_raw"]

    # 6. Verify Genuine Passage Linking for Every Field
    passages = ScientificNLPExtractor.extract_field_passages(all_text, 1)
    assert "dataset" in passages
    assert "SQuAD-v2" in passages["dataset"]["passage"]
    assert "model" in passages
    assert "RoBERTa-large" in passages["model"]["passage"]
    assert "hyperparameters" in passages
    assert "lr=2e-5" in passages["hyperparameters"]["passage"]
    assert "preprocessing" in passages
    assert "15 tokens" in passages["preprocessing"]["passage"]


def test_pdf_pipeline_study_b():
    """Validates the PDF pipeline extraction on resonance_sample_paper_B.pdf."""
    pdf_bytes = create_study_b_pdf()
    raw = pdfplumber.open(io.BytesIO(pdf_bytes))
    doc = PDFDocWrapper(raw, is_plumber=True)
    parsed = PDFParser.parse_pdf(doc)
    doc.close()
    sections = SectionParser.parse_sections(parsed["pages"])
    all_text = " ".join(s["raw_text"] for s in sections)

    # 1. Dataset Extraction
    dataset_canon, dataset_raw = normalize_dataset_name(all_text)
    assert dataset_canon == "squad_v2", f"Expected squad_v2, got {dataset_canon}"
    assert "SQuAD-v2" in dataset_raw

    # 2. Model Extraction
    model_canon, model_raw = normalize_model_architecture(all_text)
    assert model_canon == "roberta_large", f"Expected roberta_large, got {model_canon}"
    assert "RoBERTa-large" in model_raw

    # 3. Hyperparameters Extraction
    hp = ScientificNLPExtractor.extract_hyperparameters(all_text)
    assert hp.get("learning_rate") == "3e-5", f"Expected lr 3e-5, got {hp.get('learning_rate')}"
    assert hp.get("batch_size") == "32", f"Expected batch size 32, got {hp.get('batch_size')}"
    assert hp.get("optimizer") == "adamw", f"Expected optimizer adamw, got {hp.get('optimizer')}"
    assert hp.get("epochs") == "3", f"Expected epochs 3, got {hp.get('epochs')}"

    # 4. Preprocessing & Split Extraction
    prep = ScientificNLPExtractor.extract_preprocessing_snippets(all_text)
    assert any("without" in p.lower() or "uncurated" in p.lower() or "filter" in p.lower() for p in prep)

    # 5. Numerical Accuracy / Results Extraction
    results = ScientificNLPExtractor.extract_results_from_text(all_text, 1)
    assert len(results) >= 1
    assert results[0]["metric_raw"] == "Macro-F1"
    assert "76.8" in results[0]["value_raw"]

    # 6. Verify Genuine Passage Linking for Every Field
    passages = ScientificNLPExtractor.extract_field_passages(all_text, 1)
    assert "dataset" in passages
    assert "SQuAD-v2" in passages["dataset"]["passage"]
    assert "model" in passages
    assert "RoBERTa-large" in passages["model"]["passage"]
    assert "hyperparameters" in passages
    assert "lr=3e-5" in passages["hyperparameters"]["passage"]
    assert "preprocessing" in passages
    assert "filtering" in passages["preprocessing"]["passage"]


def test_analysis_engine_sample_papers_7_4_difference():
    """
    Step 3 Verification: Tests the analysis engine sequence:
    1. normalization/
    2. analysis/comparability.py
    3. analysis/conflict_detector.py
    4. analysis/root_cause.py
    5. analysis/dependency_graph.py

    Confirms:
    - 7.4 percentage-point accuracy difference (84.2% vs 76.8%)
    - Flagged differing evaluation protocols
    - Avoids claiming either difference has been proven to cause the result gap
    """
    from app.normalization.datasets import normalize_dataset_name
    from app.normalization.models import normalize_model_architecture
    from app.normalization.metrics import normalize_metric_name
    from app.normalization.units import normalize_numeric_value
    from app.analysis.comparability import ComparabilityEngine
    from app.analysis.conflict_detector import ConflictDetector
    from app.analysis.root_cause import RootCauseRankingEngine
    from app.analysis.dependency_graph import DependencyGraphGenerator
    from app.db.models import Experiment, ReportedResult, EvidenceQuote, Comparison

    # 1. Normalization
    ds_canon, _ = normalize_dataset_name("SQuAD-v2")
    assert ds_canon == "squad_v2"
    model_canon, _ = normalize_model_architecture("RoBERTa-large")
    assert model_canon == "roberta_large"
    metric_canon, unit, direction = normalize_metric_name("Macro-F1")
    assert metric_canon == "macro_f1"
    assert unit == "percent"

    # Set up experiments representing Study A and Study B
    exp_a = Experiment(
        id="exp-study-a",
        task="Question Answering",
        dataset_name="SQuAD-v2",
        dataset_normalized="squad_v2",
        dataset_distribution="Length-filtered (>15 tokens)",
        model_architecture="RoBERTa-large",
        model_normalized="roberta_large",
        preprocessing="Sentences with fewer than 15 tokens omitted from evaluation pool",
        test_split="test",
        hyperparameters={"learning_rate": "2e-5", "batch_size": "32", "epochs": "3"},
    )
    exp_b = Experiment(
        id="exp-study-b",
        task="Question Answering",
        dataset_name="SQuAD-v2",
        dataset_normalized="squad_v2",
        dataset_distribution="Comprehensive uncurated corpus",
        model_architecture="RoBERTa-large",
        model_normalized="roberta_large",
        preprocessing="Uncurated corpus evaluated without post-hoc length filtering",
        test_split="test",
        hyperparameters={"learning_rate": "3e-5", "batch_size": "32", "epochs": "3"},
    )

    # 2. Comparability Assessment
    assessment = ComparabilityEngine.assess_comparability(exp_a, exp_b)
    assert assessment["status"] == "partially_comparable"
    assert len(assessment["protocol_flags"]) >= 1
    # Check that evaluation protocols were flagged
    assert any(f["protocol_type"] == "data_filtering_protocol" for f in assessment["protocol_flags"])
    # Check that causation is NOT claimed
    assert assessment["causation_proven"] is False

    # 3. Conflict Detection: 7.4 percentage-point difference
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

    # Verify exactly 7.4 percentage-point difference
    assert conf["abs_diff"] == 7.4, f"Expected 7.4 difference, got {conf['abs_diff']}"
    assert conf["pct_points_diff"] == 7.4
    assert conf["percentage_point_difference"] == 7.4
    assert conf["causation_proven"] is False

    # 4. Root Cause / Candidate Explanation Ranking
    quote_a = EvidenceQuote(id="q-a", exact_quote="sentences with fewer than 15 tokens were omitted")
    quote_b = EvidenceQuote(id="q-b", exact_quote="comprehensive uncurated corpus without post-hoc length filtering")
    candidates = RootCauseRankingEngine.rank_candidates(exp_a, exp_b, conflicts, [quote_a], [quote_b])

    assert len(candidates) >= 1
    for c in candidates:
        # Check that causation is NEVER claimed
        assert c["causation_proven"] is False
        assert "candidate" in c["title"].lower() or "candidate" in c["explanation"].lower()
        assert "epistemic_caveat" in c

    # 5. Dependency Graph Generation
    comparison = Comparison(
        id="comp-test",
        project_id="prj-test",
        experiment_a_id=exp_a.id,
        experiment_b_id=exp_b.id,
        comparability_status="partially_comparable",
        comparability_rationale=assessment["rationale"],
    )
    graph = DependencyGraphGenerator.generate_graph(comparison, exp_a, exp_b, conflicts, candidates)
    assert len(graph["nodes"]) > 0
    assert len(graph["edges"]) > 0

    # Verify DAG has candidate explanation nodes (not verified causal nodes)
    candidate_nodes = [n for n in graph["nodes"] if n["type"] == "candidate_explanation"]
    assert len(candidate_nodes) >= 1
    assert candidate_nodes[0]["data"]["causation_proven"] is False

