import hashlib


def compute_sha256(file_bytes: bytes) -> str:
    """Compute SHA-256 checksum of raw file bytes."""
    hasher = hashlib.sha256()
    hasher.update(file_bytes)
    return hasher.hexdigest()
