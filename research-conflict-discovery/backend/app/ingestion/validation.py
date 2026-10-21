import io
from typing import Any
from fastapi import HTTPException, status, UploadFile
from app.core.config import settings

try:
    import fitz
    HAS_FITZ = True
except Exception:
    HAS_FITZ = False

import pdfplumber


class PDFValidationError(Exception):
    pass


class PDFDocWrapper:
    """Unified wrapper around pdfplumber or PyMuPDF document."""
    def __init__(self, raw_doc: Any, is_plumber: bool = True):
        self._doc = raw_doc
        self.is_plumber = is_plumber
        if is_plumber:
            self.page_count = len(raw_doc.pages)
            self.metadata = getattr(raw_doc, "metadata", {}) or {}
            self.is_encrypted = getattr(getattr(raw_doc, "doc", None), "is_encrypted", False)
        else:
            self.page_count = raw_doc.page_count
            self.metadata = raw_doc.metadata or {}
            self.is_encrypted = getattr(raw_doc, "is_encrypted", False)

    def get_page_text(self, page_idx: int) -> str:
        if self.is_plumber:
            if page_idx < len(self._doc.pages):
                return self._doc.pages[page_idx].extract_text() or ""
            return ""
        else:
            page = self._doc.load_page(page_idx)
            return page.get_text("text") or ""

    def close(self):
        try:
            self._doc.close()
        except Exception:
            pass


def validate_pdf_upload(file: UploadFile, content: bytes) -> PDFDocWrapper:
    """
    Validate that an uploaded document is a genuine, safe, non-encrypted PDF
    within allowed file size and page count constraints.
    """
    # 1. Filename Extension Check
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have a .pdf extension.",
        )

    # 2. File Size Check
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB.",
        )

    # 3. Magic Bytes Header Check
    if not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file signature: Content is not a valid PDF document.",
        )

    # 4. Open and Verify Document
    doc_wrapper = None
    try:
        pdf_stream = io.BytesIO(content)
        plumber_doc = pdfplumber.open(pdf_stream)
        doc_wrapper = PDFDocWrapper(plumber_doc, is_plumber=True)
    except Exception as e_plumber:
        err_msg = str(e_plumber).lower()
        if "password" in err_msg or "encrypt" in err_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Encrypted or password-protected PDFs are not supported.",
            )
        if HAS_FITZ:
            try:
                fitz_doc = fitz.open(stream=content, filetype="pdf")
                doc_wrapper = PDFDocWrapper(fitz_doc, is_plumber=False)
            except Exception as e_fitz:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Malformed or corrupted PDF document: {str(e_fitz)}",
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Malformed or corrupted PDF document: {str(e_plumber)}",
            )

    # 5. Encryption / Password Check
    if doc_wrapper.is_encrypted:
        doc_wrapper.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Encrypted or password-protected PDFs are not supported.",
        )

    # 6. Page Count Check
    if doc_wrapper.page_count < 1:
        doc_wrapper.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PDF document contains zero pages.",
        )

    if doc_wrapper.page_count > settings.MAX_PDF_PAGES:
        page_count = doc_wrapper.page_count
        doc_wrapper.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"PDF document exceeds page limit ({page_count} > {settings.MAX_PDF_PAGES} pages).",
        )

    return doc_wrapper
