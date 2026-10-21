import re
from typing import Tuple

MODEL_CANONICAL_MAP = {
    r"(?i)\broberta[- ]large\b": "roberta_large",
    r"(?i)\broberta[- ]base\b": "roberta_base",
    r"(?i)\bbert[- ]large\b": "bert_large",
    r"(?i)\bbert[- ]base\b": "bert_base",
    r"(?i)\bllama[- ]?2[- ]?70b\b": "llama_2_70b",
    r"(?i)\bllama[- ]?2[- ]?13b\b": "llama_2_13b",
    r"(?i)\bllama[- ]?2[- ]?7b\b": "llama_2_7b",
    r"(?i)\bllama[- ]?3[- ]?8b\b": "llama_3_8b",
    r"(?i)\bvit[- ]?b(?:ase)?(?:/16)?\b": "vit_base_16",
    r"(?i)\bvit[- ]?l(?:arge)?(?:/16)?\b": "vit_large_16",
    r"(?i)\bdeit[- ]?b(?:ase)?\b": "deit_base",
    r"(?i)\bswin[- ]?base\b": "swin_base",
    r"(?i)\bresnet[- ]?50\b": "resnet_50",
    r"(?i)\bresnet[- ]?101\b": "resnet_101",
}


def normalize_model_architecture(raw_name: str) -> Tuple[str, str]:
    """
    Normalizes neural model architecture names into canonical tokens.
    Returns: (canonical_name, raw_name)
    """
    if not raw_name:
        return "unspecified_architecture", "Unspecified"

    cleaned = raw_name.strip()
    for pattern, canonical in MODEL_CANONICAL_MAP.items():
        match = re.search(pattern, cleaned)
        if match:
            matched_raw = match.group(0) if len(cleaned) > 100 else cleaned
            return canonical, matched_raw

    slug = re.sub(r"[^a-zA-Z0-9_]", "_", cleaned.lower()).strip("_")
    fallback_raw = cleaned[:50] if len(cleaned) > 50 else cleaned
    return slug, fallback_raw
