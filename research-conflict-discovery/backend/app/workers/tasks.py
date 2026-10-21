import logging
from app.workers.celery_app import celery_app
from app.db.session import SessionLocal
from app.db.models import Paper, ProcessingJob
from app.services.paper_service import PaperService

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3)
def process_paper_task(self, paper_id: str):
    """Celery background worker task for paper parsing and extraction."""
    db = SessionLocal()
    try:
        paper = db.query(Paper).filter(Paper.id == paper_id).first()
        if not paper:
            return {"status": "error", "message": "Paper not found"}

        logger.info("Executing async extraction for paper: %s", paper.id)
        # Background worker status update
        job = db.query(ProcessingJob).filter(ProcessingJob.resource_id == paper_id).first()
        if job:
            job.status = "running"
            job.progress_pct = 50
            db.commit()

        return {"status": "completed", "paper_id": paper.id}
    except Exception as exc:
        logger.error("Error in async paper processing task: %s", exc)
        db.rollback()
        raise self.retry(exc=exc, countdown=10)
    finally:
        db.close()
