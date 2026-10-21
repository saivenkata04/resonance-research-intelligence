import os
import uuid
from typing import Tuple
from app.core.config import settings


def get_storage_base_dir() -> str:
    base = os.path.abspath(settings.STORAGE_DIR)
    os.makedirs(base, exist_ok=True)
    papers_dir = os.path.join(base, "papers")
    os.makedirs(papers_dir, exist_ok=True)
    return papers_dir


def store_pdf_securely(content: bytes) -> Tuple[str, str]:
    """
    Store PDF file safely on disk using an opaque UUID filename to prevent path traversal.
    Returns: (internal_storage_id, full_absolute_path)
    """
    papers_dir = get_storage_base_dir()
    internal_id = f"pdf-{uuid.uuid4().hex}"
    filename = f"{internal_id}.pdf"
    
    # Path traversal safeguard
    destination_path = os.path.abspath(os.path.join(papers_dir, filename))
    if not destination_path.startswith(papers_dir):
        raise ValueError("Invalid storage path: Path traversal attempt detected.")

    with open(destination_path, "wb") as f:
        f.write(content)

    return internal_id, destination_path


def cleanup_storage_file(filepath: str) -> None:
    """Safely delete a stored or quarantined file upon failure."""
    try:
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
    except Exception:
        pass
