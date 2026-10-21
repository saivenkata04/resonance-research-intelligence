import re
from typing import Tuple

METRIC_MAP = [
    (r"(?i)\bmacro[- ](?:averaged\s*)?f1\b", "macro_f1", "percent", "higher_is_better"),
    (r"(?i)\bmicro[- ](?:averaged\s*)?f1\b", "micro_f1", "percent", "higher_is_better"),
    (r"(?i)\bf1(?:[- ]score)?\b", "f1", "percent", "higher_is_better"),
    (r"(?i)\bexact\s*match\b|\bem\b", "exact_match", "percent", "higher_is_better"),
    (r"(?i)\btop[- ]1\s*(?:acc(?:uracy)?)?\b", "top1_accuracy", "percent", "higher_is_better"),
    (r"(?i)\btop[- ]5\s*(?:acc(?:uracy)?)?\b", "top5_accuracy", "percent", "higher_is_better"),
    (r"(?i)\bacc(?:uracy)?\b", "accuracy", "percent", "higher_is_better"),
    (r"(?i)\bbleu(?:[- ]\d+)?\b", "bleu", "score", "higher_is_better"),
    (r"(?i)\brouge(?:[- ]l)?\b", "rouge_l", "score", "higher_is_better"),
    (r"(?i)\b(?:auc|roc[- ]auc)\b", "auc", "score", "higher_is_better"),
    (r"(?i)\bperplexity|\bppl\b", "perplexity", "score", "lower_is_better"),
    (r"(?i)\b(?:cross[- ]entropy\s*)?loss\b", "loss", "score", "lower_is_better"),
    (r"(?i)\b(?:error\s*rate|err)\b", "error_rate", "percent", "lower_is_better"),
]


def normalize_metric_name(raw_metric: str) -> Tuple[str, str, str]:
    """
    Normalizes a metric name.
    Returns: (canonical_name, default_unit, direction)
    """
    if not raw_metric:
        return "unspecified_metric", "score", "higher_is_better"

    cleaned = raw_metric.strip()
    for pattern, canon, unit, direction in METRIC_MAP:
        if re.search(pattern, cleaned):
            return canon, unit, direction

    slug = re.sub(r"[^a-zA-Z0-9_]", "_", cleaned.lower()).strip("_")
    return slug, "score", "higher_is_better"
