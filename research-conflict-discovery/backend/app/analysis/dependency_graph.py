import networkx as nx
from typing import Dict, Any, List
from app.db.models import Experiment, Comparison, ConflictRecord, RootCauseCandidate


class DependencyGraphGenerator:
    """Builds a NetworkX DAG of experimental lineage and converts it to React Flow compatible JSON."""

    @staticmethod
    def generate_graph(
        comparison: Comparison,
        exp_a: Experiment,
        exp_b: Experiment,
        conflicts: List[ConflictRecord],
        root_causes: List[RootCauseCandidate],
    ) -> Dict[str, Any]:
        G = nx.DiGraph()

        # 1. Paper Nodes
        G.add_node("paper_a", label="Study A", type="paper", category="shared", data={"paper_id": exp_a.paper_id})
        G.add_node("paper_b", label="Study B", type="paper", category="shared", data={"paper_id": exp_b.paper_id})

        # 2. Dataset Node
        dataset_shared = exp_a.dataset_normalized == exp_b.dataset_normalized
        dataset_category = "shared" if dataset_shared else "divergent"
        G.add_node("dataset", label=f"Dataset: {exp_a.dataset_name or 'Benchmark'}", type="dataset", category=dataset_category, data={"shared": dataset_shared})
        G.add_edge("paper_a", "dataset")
        G.add_edge("paper_b", "dataset")

        # 3. Preprocessing Nodes
        prep_shared = exp_a.preprocessing == exp_b.preprocessing
        if prep_shared:
            G.add_node("preprocessing", label=f"Preprocessing: {exp_a.preprocessing or 'Standard'}", type="preprocessing", category="shared", data={})
            G.add_edge("dataset", "preprocessing")
        else:
            G.add_node("prep_a", label=f"Prep A: {exp_a.preprocessing or 'Filtered'}", type="preprocessing", category="divergent", data={})
            G.add_node("prep_b", label=f"Prep B: {exp_b.preprocessing or 'Unfiltered'}", type="preprocessing", category="divergent", data={})
            G.add_edge("dataset", "prep_a")
            G.add_edge("dataset", "prep_b")

        # 4. Model Architecture Node
        model_shared = exp_a.model_normalized == exp_b.model_normalized
        model_category = "shared" if model_shared else "divergent"
        G.add_node("model", label=f"Model: {exp_a.model_architecture or 'Transformer'}", type="model", category=model_category, data={})

        if prep_shared:
            G.add_edge("preprocessing", "model")
        else:
            G.add_edge("prep_a", "model")
            G.add_edge("prep_b", "model")

        # 5. Outcome Conflict Nodes
        for idx, conf in enumerate(conflicts):
            node_id = f"conflict_{idx}"
            metric_name = getattr(conf, "metric_name", None) or (conf.get("metric_name") if isinstance(conf, dict) else "Metric")
            val_a = getattr(conf, "val_a", None) or (conf.get("val_a") if isinstance(conf, dict) else "-")
            val_b = getattr(conf, "val_b", None) or (conf.get("val_b") if isinstance(conf, dict) else "-")
            abs_diff = getattr(conf, "abs_diff", None) or (conf.get("abs_diff") if isinstance(conf, dict) else 0.0)
            classification = getattr(conf, "classification", None) or (conf.get("classification") if isinstance(conf, dict) else "unknown")

            G.add_node(
                node_id,
                label=f"Outcome: {metric_name} ({val_a} vs {val_b})",
                type="result",
                category="conflict",
                data={"abs_diff": abs_diff, "classification": classification}
            )
            G.add_edge("model", node_id)

            # Link Candidate Explanations (avoiding unproven causal assertions)
            for r_idx, rc in enumerate(root_causes[:2]):
                rc_id = f"candidate_exp_{r_idx}"
                factor_name = getattr(rc, "factor_category", "candidate_factor") if hasattr(rc, "factor_category") else rc.get("factor_category", "candidate_factor")
                plausibility = getattr(rc, "plausibility_score", 0.85) if hasattr(rc, "plausibility_score") else rc.get("plausibility_score", 0.85)
                expl = getattr(rc, "explanation", "") if hasattr(rc, "explanation") else rc.get("explanation", "")
                if rc_id not in G:
                    G.add_node(
                        rc_id,
                        label=f"Candidate: {factor_name.replace('_', ' ').title()}",
                        type="candidate_explanation",
                        category="candidate",
                        data={
                            "plausibility": plausibility,
                            "explanation": expl[:120] if expl else "",
                            "causation_proven": False,
                        }
                    )
                G.add_edge(node_id, rc_id)

        # Serialize to frontend format
        nodes_list = []
        for n, attrs in G.nodes(data=True):
            nodes_list.append({
                "id": str(n),
                "label": attrs.get("label", str(n)),
                "type": attrs.get("type", "default"),
                "category": attrs.get("category", "shared"),
                "data": attrs.get("data", {}),
            })

        edges_list = []
        for u, v in G.edges():
            edges_list.append({
                "id": f"e_{u}_{v}",
                "source": str(u),
                "target": str(v),
            })

        return {
            "nodes": nodes_list,
            "edges": edges_list,
        }
