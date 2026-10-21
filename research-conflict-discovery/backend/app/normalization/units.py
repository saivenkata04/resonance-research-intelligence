from typing import Tuple, Optional


def normalize_numeric_value(raw_val_str: str, unit: str = "percent") -> Tuple[float, str]:
    """
    Normalizes numeric metric string into standard float.
    For percent metrics, if reported as a fraction between 0.0 and 1.0 (e.g., '0.842'),
    it scales it to 84.2%. If already reported as '84.2' or '84.2%', scales appropriately.
    Returns: (normalized_float, canonical_unit)
    """
    cleaned = raw_val_str.replace("%", "").strip()
    try:
        val = float(cleaned)
    except ValueError:
        return 0.0, unit

    # If the metric is a percentage and value is < 1.0 (e.g., 0.842 F1), normalize to 84.2
    if unit == "percent" and 0.0 < val <= 1.0:
        val = round(val * 100.0, 4)

    return val, unit
