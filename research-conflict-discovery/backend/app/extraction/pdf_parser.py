from typing import Dict, Any, List


class PDFParser:
    """Extracts raw text, page bounds, and structural metadata from scientific PDFs."""

    @staticmethod
    def parse_pdf(doc: Any) -> Dict[str, Any]:
        pages_data: List[Dict[str, Any]] = []
        total_text_length = 0

        # Extract title from PDF metadata if available
        meta = getattr(doc, "metadata", {}) or {}
        title_candidate = meta.get("title", "") if isinstance(meta, dict) else ""
        title_candidate = title_candidate.strip() if title_candidate else ""

        page_count = getattr(doc, "page_count", 0)

        for page_idx in range(page_count):
            if hasattr(doc, "get_page_text"):
                text = doc.get_page_text(page_idx) or ""
            elif hasattr(doc, "load_page"):
                page = doc.load_page(page_idx)
                text = page.get_text("text") or ""
            else:
                text = ""

            text_clean = text.strip()
            total_text_length += len(text_clean)

            # Fallback title extraction from the very first lines of page 1
            if page_idx == 0 and (not title_candidate or len(title_candidate) < 5):
                lines = [l.strip() for l in text.split("\n") if len(l.strip()) > 5]
                if lines:
                    title_candidate = lines[0]

            pages_data.append({
                "page_number": page_idx + 1,
                "text": text,
                "char_count": len(text_clean),
            })

        # Scanned / Image-only detection heuristic
        ocr_required = False
        sample_pages = min(3, len(pages_data))
        sample_chars = sum(pages_data[i]["char_count"] for i in range(sample_pages))
        if sample_chars < 150:
            ocr_required = True

        return {
            "page_count": page_count,
            "title_candidate": title_candidate or "Extracted Scientific Study",
            "ocr_required": ocr_required,
            "pages": pages_data,
        }
