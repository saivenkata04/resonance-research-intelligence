# RESONANCE — Research Intelligence

> **Scientific Research Conflict Analysis and Root-Cause Discovery System**
> Transform scientific literature analysis from *"What do these papers say?"* into *"Why do these papers disagree?"*.

---

## 🎨 Design System & Visual Palette

| Token | Hex | Role |
| :--- | :--- | :--- |
| **Primary Background** | `#F5F7FA` | Clean canvas for data readability |
| **Header** | `#101827` | Dark navy top brand navigation |
| **Sidebar** | `#172235` | Dark navy workspace navigation |
| **Primary Accent** | `#36C9C0` | Teal highlights, primary CTAs |
| **Main Text** | `#101827` | High-contrast body text |
| **Secondary Text** | `#64748B` | Metadata, subtitles, timestamps |
| **Card Background** | `#FFFFFF` | Rounded cards, subtle border `#DCE4EE` |
| **Warning Accent** | `#F59E0B` | Ambiguities & plausible hypotheses |
| **Conflict Accent** | `#EF6B73` | Pipeline discrepancies & divergent nodes |
| **Success Accent** | `#34D399` | Aligned attributes & verified facts |

---

## 🚀 Running the Frontend

Navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Frontend Architecture & Pages

- **Overview / Dashboard** (`/dashboard` & `/`):
  - Welcome greeting: *"Good morning, Researcher"*
  - Primary Action Hero: *"Start a new analysis"* with interactive upload modal
  - Dual statistics cards for indexed papers and detected conflicts
  - Recent analysis table with direct links to comparisons and reports
- **Paper Library** (`/papers`):
  - PDF drag-and-drop upload modal with progress stage animation
  - Search, status filtering (Ready, Ambiguity Warning, Processing)
  - Multi-paper selection for launching cross-paper comparisons
- **Experiment Comparisons** (`/comparisons` & `/comparisons/[id]`):
  - Side-by-side experiment profiles (e.g. ViT vs DeiT on ImageNet)
  - Detailed attribute comparison matrix with diff highlighting
  - Missing information markers ("Not reported in text")
  - Comparability verdict badge (Comparable / Partially Comparable / Incomparable)
  - Interactive clickable quotes opening the **Evidence Drawer**
- **Experiment Graph** (`/graph` & `/graph/[id]`):
  - Interactive sequential DAG: Dataset → Split → Preprocessing → Model → Hyperparameters → Evaluation → Results
  - Visual color-coded divergence points (Green = Aligned, Red = Divergent)
  - Node inspection panel with ground-truth citations
- **Root-Cause Analysis** (`/root-causes` & `/root-causes/[id]`):
  - Ranked algorithmic attribution isolating the true causes of discrepancies
  - Epistemological distinction: **Observed Differences (Facts)** vs **Plausible Hypotheses (Unverified)**
  - Confidence meters and impact factor breakdowns
- **Reports** (`/reports` & `/reports/[id]`):
  - Printable and exportable audit report with executive summary, conflict tables, and limitations.
