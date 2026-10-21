import pdfplumber
from typing import List, Dict, Any


class TableParser:
    """Extracts tables from scientific PDFs to capture metrics, benchmarks, and comparison rows."""

    @staticmethod
    def extract_tables_from_file(file_path: str) -> List[Dict[str, Any]]:
        extracted_tables: List[Dict[str, Any]] = []

        try:
            with pdfplumber.open(file_path) as pdf:
                for page_idx, page in enumerate(pdf.pages):
                    tables = page.extract_tables()
                    for table_idx, table in enumerate(tables):
                        if not table or len(table) < 2:
                            continue

                        # Clean nulls
                        cleaned_rows = []
                        for row in table:
                            cleaned_row = [str(cell).strip() if cell is not None else "" for cell in row]
                            if any(cleaned_row):
                                cleaned_rows.append(cleaned_row)

                        if len(cleaned_rows) >= 2:
                            header = cleaned_rows[0]
                            data_rows = cleaned_rows[1:]
                            extracted_tables.append({
                                "page_number": page_idx + 1,
                                "table_index": table_idx,
                                "headers": header,
                                "rows": data_rows,
                            })
        except Exception:
            # Table extraction failure should gracefully fallback without crashing the pipeline
            pass

        return extracted_tables
