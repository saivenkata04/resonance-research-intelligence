import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.db.session import get_db

router = APIRouter()


@router.get("/health", tags=["Operational"])
def health_check():
    """Simple liveness probe."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }


@router.get("/ready", tags=["Operational"])
def readiness_check(db: Session = Depends(get_db)):
    """Readiness probe checking database connectivity and storage directory."""
    checks = {}
    is_ready = True

    # 1. Check Database
    try:
        db.execute(text("SELECT 1"))
        checks["database"] = "connected"
    except Exception as e:
        checks["database"] = f"unreachable: {str(e)}"
        is_ready = False

    # 2. Check Storage
    try:
        os.makedirs(settings.STORAGE_DIR, exist_ok=True)
        test_file = os.path.join(settings.STORAGE_DIR, ".health_check")
        with open(test_file, "w") as f:
            f.write("ok")
        os.remove(test_file)
        checks["storage"] = "writable"
    except Exception as e:
        checks["storage"] = f"unwritable: {str(e)}"
        is_ready = False

    if not is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "not_ready", "checks": checks}
        )

    return {
        "status": "ready",
        "checks": checks,
    }
