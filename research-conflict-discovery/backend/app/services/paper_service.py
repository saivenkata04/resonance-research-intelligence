import os
import uuid
from typing import Dict, Any, List
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.db.models import Paper, PaperSection, ProcessingJob, User
from app.ingestion.validation import validate_pdf_upload
from app.ingestion.hashing import compute_sha256
from app.ingestion.storage import store_pdf_securely, cleanup_storage_file
from app.extraction.pdf_parser import PDFParser
from app.extraction.section_parser import SectionParser
from app.extraction.table_parser import TableParser
from app.extraction.experiment_extractor import ExperimentExtractor
from app.audit.service import AuditService


class PaperService:
    @staticmethod
    def process_paper_upload(
        db: Session,
        file: UploadFile,
        project_id: str,
        user: User,
    ) -> Paper:
        # Read content
        content = file.file.read()
        
        # 1. Validation & Magic Check
        doc = validate_pdf_upload(file, content)
        
        # 2. Compute Checksum
        checksum = compute_sha256(content)

        # 3. Store PDF safely
        storage_id, file_path = store_pdf_securely(content)

        # 4. Create Paper Record in DB
        paper = Paper(
            project_id=project_id,
            uploaded_by_id=user.id,
            title=file.filename.replace(".pdf", "").replace("_", " ").title(),
            file_path=file_path,
            checksum_sha256=checksum,
            file_size_bytes=len(content),
            page_count=doc.page_count,
            status="processing",
        )
        db.add(paper)
        db.commit()
        db.refresh(paper)

        # Create Processing Job
        job = ProcessingJob(
            user_id=user.id,
            job_type="paper_ingestion",
            resource_id=paper.id,
            status="running",
            progress_pct=20,
            current_step="Parsing document text and metadata",
        )
        db.add(job)
        db.commit()

        try:
            # 5. Extract Text & Metadata
            parsed = PDFParser.parse_pdf(doc)
            doc.close()

            if parsed.get("title_candidate") and len(parsed["title_candidate"]) > 5:
                paper.title = parsed["title_candidate"][:490]
            paper.ocr_required = parsed["ocr_required"]

            job.progress_pct = 40
            job.current_step = "Segmenting scientific sections"
            db.commit()

            # 6. Parse Canonical Sections
            raw_sections = SectionParser.parse_sections(parsed["pages"])
            db_sections: List[PaperSection] = []
            for s in raw_sections:
                sec_rec = PaperSection(
                    paper_id=paper.id,
                    section_name=s["section_name"],
                    page_number=s["page_number"],
                    order_index=s["order_index"],
                    raw_text=s["raw_text"],
                    char_start=s["char_start"],
                    char_end=s["char_end"],
                )
                db.add(sec_rec)
                db_sections.append(sec_rec)
            db.commit()

            job.progress_pct = 65
            job.current_step = "Extracting tables and experimental profiles"
            db.commit()

            # 7. Extract Tables
            tables = TableParser.extract_tables_from_file(file_path)

            # 8. Extract Experiments and Evidence-backed Results
            experiments = ExperimentExtractor.extract_and_persist(db, paper, db_sections, tables)

            # Complete Job
            paper.status = "completed"
            job.status = "completed"
            job.progress_pct = 100
            job.current_step = "Extraction completed successfully"
            db.commit()

            # Audit Event
            AuditService.log_event(
                db=db,
                event_type="upload",
                target_resource=f"paper:{paper.id}",
                user_id=user.id,
                project_id=project_id,
                details={"filename": file.filename, "checksum": checksum, "experiments_extracted": len(experiments)},
            )

            db.refresh(paper)
            return paper

        except Exception as e:
            paper.status = "failed"
            paper.error_message = str(e)
            job.status = "failed"
            job.error_details = str(e)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process and extract scientific paper: {str(e)}"
            )

    @staticmethod
    def reprocess_paper(db: Session, paper: Paper) -> Paper:
        """Retry extraction on an existing paper with stored file."""
        if not paper.file_path or not os.path.exists(paper.file_path):
            paper.status = "failed"
            paper.error_message = "Source PDF file not found on disk for reprocessing."
            db.commit()
            return paper

        try:
            import pdfplumber
            from app.ingestion.validation import PDFDocWrapper
            raw_doc = pdfplumber.open(paper.file_path)
            doc = PDFDocWrapper(raw_doc, is_plumber=True)
            parsed = PDFParser.parse_pdf(doc)
            doc.close()

            if parsed.get("title_candidate") and len(parsed["title_candidate"]) > 5:
                paper.title = parsed["title_candidate"][:490]
            paper.ocr_required = parsed["ocr_required"]

            # Clear old sections before re-inserting
            db.query(PaperSection).filter(PaperSection.paper_id == paper.id).delete()
            db.commit()

            raw_sections = SectionParser.parse_sections(parsed["pages"])
            db_sections: List[PaperSection] = []
            for s in raw_sections:
                sec_rec = PaperSection(
                    paper_id=paper.id,
                    section_name=s["section_name"],
                    page_number=s["page_number"],
                    order_index=s["order_index"],
                    raw_text=s["raw_text"],
                    char_start=s["char_start"],
                    char_end=s["char_end"],
                )
                db.add(sec_rec)
                db_sections.append(sec_rec)
            db.commit()

            tables = TableParser.extract_tables_from_file(paper.file_path)
            ExperimentExtractor.extract_and_persist(db, paper, db_sections, tables)

            paper.status = "completed"
            paper.error_message = None
            db.commit()
            db.refresh(paper)
            return paper

        except Exception as e:
            paper.status = "failed"
            paper.error_message = str(e)
            db.commit()
            return paper
