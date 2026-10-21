import re
from typing import List, Dict, Any

CANONICAL_SECTIONS = [
    (r"(?i)\babstract\b", "Abstract"),
    (r"(?i)\b(?:1\.?\s*)?introduction\b", "Introduction"),
    (r"(?i)\b(?:2\.?\s*)?related\s+work\b", "Related Work"),
    (r"(?i)\b(?:3\.?\s*)?(?:methodology|method|model\s+architecture|proposed\s+approach)\b", "Methodology"),
    (r"(?i)\b(?:4\.?\s*)?(?:experiments|experimental\s+setup|evaluation\s+protocol|datasets?)\b", "Experiments"),
    (r"(?i)\b(?:5\.?\s*)?(?:results|empirical\s+findings|discussion)\b", "Results"),
    (r"(?i)\b(?:6\.?\s*)?(?:limitations|broader\s+impacts?)\b", "Limitations"),
    (r"(?i)\b(?:7\.?\s*)?(?:conclusion|concluding\s+remarks)\b", "Conclusion"),
]


class SectionParser:
    """Partitions scientific paper text into recognized canonical sections with page numbers."""

    @staticmethod
    def parse_sections(pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        sections: List[Dict[str, Any]] = []
        current_section = "Abstract"
        current_text = []
        current_page = 1
        order_idx = 0

        for page in pages:
            page_num = page["page_number"]
            lines = page["text"].split("\n")

            for line in lines:
                line_stripped = line.strip()
                if not line_stripped:
                    continue

                # Check if this line marks the beginning of a new canonical scientific section
                matched_section = None
                if len(line_stripped) < 60:  # Section headings are generally concise
                    for pattern, canon_name in CANONICAL_SECTIONS:
                        if re.match(pattern, line_stripped):
                            matched_section = canon_name
                            break

                if matched_section and matched_section != current_section:
                    # Flush previous section
                    if current_text:
                        combined_text = "\n".join(current_text)
                        sections.append({
                            "section_name": current_section,
                            "page_number": current_page,
                            "order_index": order_idx,
                            "raw_text": combined_text,
                            "char_start": 0,
                            "char_end": len(combined_text),
                        })
                        order_idx += 1
                        current_text = []

                    current_section = matched_section
                    current_page = page_num

                current_text.append(line_stripped)

        # Flush final section
        if current_text:
            combined_text = "\n".join(current_text)
            sections.append({
                "section_name": current_section,
                "page_number": current_page,
                "order_index": order_idx,
                "raw_text": combined_text,
                "char_start": 0,
                "char_end": len(combined_text),
            })

        # Fallback if no specific sections matched (e.g., short format)
        if not sections and pages:
            all_text = "\n".join(p["text"] for p in pages)
            sections.append({
                "section_name": "Full Manuscript",
                "page_number": 1,
                "order_index": 0,
                "raw_text": all_text,
                "char_start": 0,
                "char_end": len(all_text),
            })

        return sections
