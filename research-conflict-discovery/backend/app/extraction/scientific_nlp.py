import re
from typing import List, Dict, Any, Optional

TASK_PATTERNS = [
    (r"(?i)\bquestion\s+answering\b|\bqa\b", "Question Answering"),
    (r"(?i)\bimage\s+classification\b", "Image Classification"),
    (r"(?i)\bnatural\s+language\s+inference\b|\bnli\b", "Natural Language Inference"),
    (r"(?i)\bnamed\s+entity\s+recognition\b|\bner\b", "Named Entity Recognition"),
    (r"(?i)\bmachine\s+translation\b", "Machine Translation"),
    (r"(?i)\bobject\s+detection\b", "Object Detection"),
    (r"(?i)\btext\s+summarization\b", "Text Summarization"),
]

HP_PATTERNS = {
    "learning_rate": r"(?i)(?:lr|learning\s*rate)\s*(?:=|:|is|of)?\s*([0-9]+(?:\.[0-9]+)?(?:e-[0-9]+)?)",
    "batch_size": r"(?i)(?:batch\s*size|bs)\s*(?:=|:|is|of)?\s*([0-9]+)",
    "optimizer": r"(?i)\b(adamw?|sgd|rmsprop|adagrad|lamb|lion)\b",
    "epochs": r"(?i)(?:(?:epochs?|training\s*steps?)\s*(?:=|:|is|of)?\s*([0-9]+(?:k|m)?)|(?:for\s*)?([0-9]+(?:k|m)?)\s*(?:epochs?|training\s*steps?))",
    "weight_decay": r"(?i)(?:weight\s*decay)\s*(?:=|:|is|of)?\s*([0-9]+(?:\.[0-9]+)?(?:e-[0-9]+)?)",
    "warmup": r"(?i)(?:warmup(?:\s*ratio|\s*steps)?)\s*(?:=|:|is|of)?\s*([0-9]+(?:\.[0-9]+)?(?:%)?)",
}

PREPROCESSING_PATTERNS = [
    r"(?i)(?:filter(?:ed|ing)?\s*(?:out|subset|sentences?|queries|tokens?)?[^.\n]{0,80})",
    r"(?i)(?:tokeniz(?:er|ation)\s*(?:is|was|using)?[^.\n]{0,80})",
    r"(?i)(?:normaliz(?:ed|ation)|lowercas(?:ed|ing)|stop[- ]?words?)[^.\n]{0,80}",
    r"(?i)(?:augment(?:ed|ation)|random\s*(?:crop|flip|erase))[^.\n]{0,80}",
    r"(?i)(?:(?:without\s*(?:post[- ]hoc\s*)?)?length\s*(?:threshold|cutoff|filter(?:ed|ing)?))[^.\n]{0,80}",
    r"(?i)(?:comprehensive\s*uncurated\s*corpus[^.\n]{0,80})",
    r"(?i)(?:sentences\s*with\s*fewer\s*than\s*[0-9]+\s*tokens\s*were\s*omitted[^.\n]{0,80})",
]

RESULT_PATTERN = re.compile(
    r"(?i)\b(f1|macro[- ]f1|micro[- ]f1|exact\s*match|em|accuracy|acc|top[- ]1|top[- ]5|bleu|rouge|loss|auc)\b"
    r"[^0-9\n]{1,35}"
    r"([0-9]{1,3}(?:\.[0-9]+)?)"
    r"\s*(%|percent)?"
    r"(?:\s*(?:±|\+\/-|\ufffd)\s*([0-9]+(?:\.[0-9]+)?))?"
)


class ScientificNLPExtractor:
    """Scientific NLP rule and pattern extractor for methodology, hyperparameters, and results."""

    @staticmethod
    def extract_task(text: str) -> Optional[str]:
        for pattern, task_name in TASK_PATTERNS:
            if re.search(pattern, text):
                return task_name
        return None

    @staticmethod
    def extract_hyperparameters(text: str) -> Dict[str, str]:
        hp: Dict[str, str] = {}
        for key, pattern in HP_PATTERNS.items():
            match = re.search(pattern, text)
            if match:
                # Handle dual-group capture (e.g., epochs=3 or 3 epochs)
                val = match.group(1) if match.group(1) is not None else (match.group(2) if len(match.groups()) >= 2 else None)
                if val:
                    hp[key] = val
        return hp

    @staticmethod
    def extract_preprocessing_snippets(text: str) -> List[str]:
        snippets = []
        for pat in PREPROCESSING_PATTERNS:
            matches = re.findall(pat, text)
            for m in matches:
                clean_snippet = m.strip().replace("\n", " ")
                if len(clean_snippet) > 8 and clean_snippet not in snippets:
                    snippets.append(clean_snippet)
        return snippets

    @staticmethod
    def extract_results_from_text(text: str, page_number: int) -> List[Dict[str, Any]]:
        extracted = []
        sentences = re.split(r"(?<=[.!?])\s+", text)

        for sentence in sentences:
            sentence_clean = sentence.strip().replace("\n", " ")
            if not sentence_clean or len(sentence_clean) < 15:
                continue

            matches = RESULT_PATTERN.finditer(sentence_clean)
            for m in matches:
                metric_raw = m.group(1)
                value_raw = m.group(2)
                has_percent = bool(m.group(3))
                uncertainty = m.group(4)

                val_str = f"{value_raw}%" if has_percent else value_raw
                extracted.append({
                    "metric_raw": metric_raw,
                    "value_raw": val_str,
                    "uncertainty_raw": f"±{uncertainty}" if uncertainty else None,
                    "sentence_quote": sentence_clean,
                    "page_number": page_number,
                })

        return extracted

    @staticmethod
    def extract_field_passages(text: str, page_number: int = 1) -> Dict[str, Dict[str, Any]]:
        """
        Locates the exact verbatim sentence passage in the PDF text corresponding to each
        scientific experiment field: dataset, model, split, preprocessing, and hyperparameters.
        """
        sentences = [
            s.strip().replace("\n", " ")
            for s in re.split(r"(?<=[.!?])\s+", text)
            if len(s.strip()) > 15
        ]

        passages: Dict[str, Dict[str, Any]] = {}

        # 1. Dataset Passage
        for s in sentences:
            if re.search(r"(?i)\b(squad|imagenet|glue|cifar|triviaqa)\b", s):
                passages["dataset"] = {"passage": s, "page_number": page_number}
                break

        # 2. Model Passage
        for s in sentences:
            if re.search(r"(?i)\b(roberta|bert|vit|deit|llama|resnet|transformer)\b", s):
                passages["model"] = {"passage": s, "page_number": page_number}
                break

        # 3. Preprocessing / Filtering Passage
        for s in sentences:
            if re.search(r"(?i)\b(filter|filtering|token|omitted|preprocess|uncurated|crop|augment|normalize)\b", s):
                passages["preprocessing"] = {"passage": s, "page_number": page_number}
                break

        # 4. Evaluation Split Passage
        for s in sentences:
            if re.search(r"(?i)\b(test|split|evaluation pool|target|targets|test set|dev set|corpus)\b", s):
                passages["split"] = {"passage": s, "page_number": page_number}
                break

        # 5. Hyperparameters Passage
        for s in sentences:
            if re.search(r"(?i)\b(lr|learning\s*rate|batch\s*size|optimizer|adamw|epochs?)\b", s):
                passages["hyperparameters"] = {"passage": s, "page_number": page_number}
                break

        return passages
