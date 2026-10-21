import re
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.db.models import Paper, PaperSection, EvidenceQuote, Experiment, ReportedResult
from app.extraction.scientific_nlp import ScientificNLPExtractor
from app.normalization.datasets import normalize_dataset_name
from app.normalization.models import normalize_model_architecture
from app.normalization.metrics import normalize_metric_name
from app.normalization.units import normalize_numeric_value


class ExperimentExtractor:
    """Extracts structured experiment configurations and verifiable results from parsed sections."""

    @staticmethod
    def extract_and_persist(db: Session, paper: Paper, sections: List[PaperSection], tables: List[Dict[str, Any]]) -> List[Experiment]:
        all_text = " ".join(s.raw_text for s in sections)

        # 1. Extract High-Level Task
        task = ScientificNLPExtractor.extract_task(all_text) or "Benchmarking"

        # 2. Extract Dataset candidates
        dataset_canon, dataset_raw = normalize_dataset_name(all_text)

        # 3. Extract Model Architecture
        model_canon, model_raw = normalize_model_architecture(all_text)

        # 4. Extract Hyperparameters, Preprocessing & Field Passages
        hyperparameters = ScientificNLPExtractor.extract_hyperparameters(all_text)
        preprocessing_snippets = ScientificNLPExtractor.extract_preprocessing_snippets(all_text)
        preprocessing_desc = "; ".join(preprocessing_snippets) if preprocessing_snippets else "Standard preprocessing"
        field_passages = ScientificNLPExtractor.extract_field_passages(all_text, sections[0].page_number if sections else 1)

        # Create Primary Experiment
        exp = Experiment(
            paper_id=paper.id,
            name=f"{model_raw} on {dataset_raw}",
            task=task,
            dataset_name=dataset_raw,
            dataset_normalized=dataset_canon,
            dataset_version="v2.0" if "v2" in dataset_raw.lower() else "v1.0",
            dataset_distribution="Length-filtered" if "filter" in preprocessing_desc.lower() else "Standard evaluation split",
            train_split="train",
            val_split="dev",
            test_split="test",
            preprocessing=preprocessing_desc,
            augmentation="Standard",
            model_architecture=model_raw,
            model_normalized=model_canon,
            model_version="1.0",
            hyperparameters=hyperparameters,
            training_protocol={
                "epochs": hyperparameters.get("epochs", "unreported"),
                "optimizer": hyperparameters.get("optimizer", "adamw"),
                "field_passages": {k: v["passage"] for k, v in field_passages.items()},
            },
            evaluation_protocol={
                "evaluation_mode": "zero_shot" if "zero" in all_text.lower() else "fine_tuned",
                "field_passages": {k: v["passage"] for k, v in field_passages.items()},
            },
            limitations="Observational research study findings subject to distribution shift.",
        )
        db.add(exp)
        db.commit()
        db.refresh(exp)

        # Persist verifiable evidence quotes for each extracted field
        for field_name, pass_info in field_passages.items():
            field_quote = EvidenceQuote(
                paper_id=paper.id,
                section_id=sections[0].id if sections else None,
                page_number=pass_info.get("page_number", 1),
                exact_quote=pass_info["passage"],
                extraction_method=f"provenance_{field_name}",
                confidence=0.95,
            )
            db.add(field_quote)
        db.commit()

        # 5. Extract Reported Results with Evidence Quotes
        results_found = []
        for section in sections:
            extracted_res = ScientificNLPExtractor.extract_results_from_text(section.raw_text, section.page_number)
            for res_item in extracted_res:
                    metric_canon, unit, direction = normalize_metric_name(res_item["metric_raw"])
                    norm_val, norm_unit = normalize_numeric_value(res_item["value_raw"], unit)

                    # Create verifiable evidence quote record
                    quote_rec = EvidenceQuote(
                        paper_id=paper.id,
                        section_id=section.id,
                        page_number=res_item["page_number"],
                        exact_quote=res_item["sentence_quote"],
                        extraction_method="scientific_nlp_rule",
                        confidence=0.92,
                    )
                    db.add(quote_rec)
                    db.commit()
                    db.refresh(quote_rec)

                    unc_raw = res_item.get("uncertainty_raw")
                    unc_num = None
                    if unc_raw:
                        num_digits = re.sub(r"[^\d.]", "", unc_raw)
                        unc_num = float(num_digits) if num_digits else None

                    # Create reported result tied to evidence quote
                    result_rec = ReportedResult(
                        experiment_id=exp.id,
                        evidence_quote_id=quote_rec.id,
                        metric_raw_name=res_item["metric_raw"],
                        metric_normalized_name=metric_canon,
                        raw_value_str=res_item["value_raw"],
                        normalized_numeric_value=norm_val,
                        unit=norm_unit,
                        direction=direction,
                        evaluation_split="test",
                        uncertainty_raw=unc_raw,
                        uncertainty_numeric=unc_num,
                    )
                    db.add(result_rec)
                    results_found.append(result_rec)

        db.commit()

        # If no explicit numerical results matched regex from text, check extracted tables
        if not results_found and tables:
            for table in tables:
                headers = [h.lower() for h in table["headers"]]
                for row in table["rows"]:
                    for col_idx, cell in enumerate(row):
                        # Simple digit percentage matcher in table cell
                        num_match = re.search(r"([0-9]{1,3}(?:\.[0-9]+)?)\s*%", cell)
                        if num_match:
                            header_name = headers[col_idx] if col_idx < len(headers) else "accuracy"
                            metric_canon, unit, direction = normalize_metric_name(header_name)
                            norm_val, norm_unit = normalize_numeric_value(num_match.group(1), unit)

                            quote_rec = EvidenceQuote(
                                paper_id=paper.id,
                                section_id=None,
                                page_number=table["page_number"],
                                exact_quote=f"Table {table['table_index'] + 1} row: {' | '.join(row)}",
                                extraction_method="table_parser",
                                confidence=0.88,
                            )
                            db.add(quote_rec)
                            db.commit()
                            db.refresh(quote_rec)

                            result_rec = ReportedResult(
                                experiment_id=exp.id,
                                evidence_quote_id=quote_rec.id,
                                metric_raw_name=header_name,
                                metric_normalized_name=metric_canon,
                                raw_value_str=f"{num_match.group(1)}%",
                                normalized_numeric_value=norm_val,
                                unit=norm_unit,
                                direction=direction,
                                evaluation_split="test",
                            )
                            db.add(result_rec)
                            results_found.append(result_rec)
            db.commit()

        return [exp]
