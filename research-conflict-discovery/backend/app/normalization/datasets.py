import re
from typing import Tuple

DATASET_CANONICAL_MAP = {
    r"(?i)\bsquad[ -]?v?2(?:\.0)?\b": "squad_v2",
    r"(?i)\bsquad[ -]?v?1(?:\.1)?\b": "squad_v1",
    r"(?i)\bimagenet[ -]?1k\b": "imagenet_1k",
    r"(?i)\bimagenet\b": "imagenet",
    r"(?i)\bglue\b": "glue",
    r"(?i)\bsuperglue\b": "superglue",
    r"(?i)\bcifar[ -]?100\b": "cifar_100",
    r"(?i)\bcifar[ -]?10\b": "cifar_10",
    r"(?i)\bmimic[ -]?iii\b": "mimic_iii",
    r"(?i)\btriviaqa\b": "triviaqa",
}


def normalize_dataset_name(raw_name: str) -> Tuple[str, str]:
    """
    Normalizes dataset names into canonical identifiers while preserving raw string.
    Returns: (canonical_name, raw_name)
    """
    if not raw_name:
        return "unspecified_dataset", "Unspecified"

    cleaned = raw_name.strip()
    for pattern, canonical in DATASET_CANONICAL_MAP.items():
        match = re.search(pattern, cleaned)
        if match:
            matched_raw = match.group(0) if len(cleaned) > 100 else cleaned
            return canonical, matched_raw

    # Fallback to normalized lowercase slug
    slug = re.sub(r"[^a-zA-Z0-9_]", "_", cleaned.lower()).strip("_")
    fallback_raw = cleaned[:50] if len(cleaned) > 50 else cleaned
    return slug, fallback_raw
