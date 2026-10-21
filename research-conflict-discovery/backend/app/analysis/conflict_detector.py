from typing import List, Dict, Any
from app.db.models import ReportedResult, ConflictRecord


class ConflictDetector:
    """Detects and classifies numerical and directional conflicts across comparable metrics."""

    @staticmethod
    def detect_conflicts(results_a: List[ReportedResult], results_b: List[ReportedResult]) -> List[Dict[str, Any]]:
        conflicts: List[Dict[str, Any]] = []

        # Index results by normalized metric name
        b_map: Dict[str, ReportedResult] = {r.metric_normalized_name: r for r in results_b}

        for res_a in results_a:
            metric_key = res_a.metric_normalized_name
            # Direct match or compatibility fallback (e.g., f1 vs macro_f1)
            res_b = b_map.get(metric_key)
            if not res_b:
                if "f1" in metric_key:
                    for k, v in b_map.items():
                        if "f1" in k:
                            res_b = v
                            break

            if not res_b:
                continue

            val_a = res_a.normalized_numeric_value
            val_b = res_b.normalized_numeric_value
            abs_diff = round(abs(val_a - val_b), 4)

            # Explicit percentage-point difference for percentage metrics
            is_percentage = res_a.unit == "percent"
            pct_points_diff = round(abs(val_a - val_b), 2) if is_percentage else None

            # Safe relative difference calculation
            avg_val = (abs(val_a) + abs(val_b)) / 2.0
            relative_pct_diff = round((abs_diff / avg_val) * 100.0, 2) if avg_val > 0.0001 else None

            # Directional conflict: when one paper claims improvement and the other reports degradation
            direction_conflict = False
            if (val_a > val_b and res_a.direction == "lower_is_better") or (val_b > val_a and res_a.direction == "higher_is_better"):
                direction_conflict = True

            # Uncertainty bounds check
            uncertainty_margin = (res_a.uncertainty_numeric or 0.0) + (res_b.uncertainty_numeric or 0.0)

            # Conflict Classification Logic
            unit_display = "percentage-points" if is_percentage else res_a.unit

            if uncertainty_margin > 0 and abs_diff <= uncertainty_margin:
                classification = "within_variance"
                rationale = f"Observed difference of {abs_diff} {unit_display} is within combined reported uncertainty margin of ±{uncertainty_margin}."
            elif res_a.metric_normalized_name != res_b.metric_normalized_name:
                classification = "inconclusive"
                rationale = f"Apparent discrepancy ({val_a} vs {val_b}) likely stems from disparate metric formulations ('{res_a.metric_raw_name}' vs '{res_b.metric_raw_name}')."
            elif abs_diff >= 10.0:
                classification = "severe_conflict"
                rationale = f"Substantial performance divergence of {abs_diff} {unit_display} between studies on comparable benchmark task."
            elif abs_diff >= 3.0:
                classification = "moderate_conflict"
                rationale = f"Moderate performance gap of {abs_diff} {unit_display} observed across published experiments."
            else:
                classification = "within_variance"
                rationale = f"Minor divergence of {abs_diff} {unit_display} consistent with typical stochastic variations and random seed initialization."

            conflicts.append({
                "metric_name": res_a.metric_normalized_name,
                "val_a": val_a,
                "val_b": val_b,
                "abs_diff": abs_diff,
                "pct_points_diff": pct_points_diff,
                "percentage_point_difference": pct_points_diff,
                "relative_pct_diff": relative_pct_diff,
                "direction_conflict": direction_conflict,
                "classification": classification,
                "rationale": rationale,
                "causation_proven": False,
                "epistemic_level": "observed_discrepancy",
            })

        return conflicts
