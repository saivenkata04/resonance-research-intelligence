import logging
from sqlalchemy.orm import Session
from app.db.session import Base, engine, SessionLocal
from app.db.models import User, Project, ProjectMember

from app.core.security import get_password_hash

from sqlalchemy import text

logger = logging.getLogger(__name__)


def run_migrations(conn):
    """Automatically apply schema updates to existing SQLite/PostgreSQL databases."""
    columns_to_add = [
        ("processing_jobs", "user_id", "VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE"),
        ("comparisons", "created_by_id", "VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL"),
        ("reports", "created_by_id", "VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL"),
    ]
    for table, column, col_type in columns_to_add:
        try:
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"))
            conn.commit()
            logger.info("Migrated table '%s': added column '%s'", table, column)
        except Exception:
            # Column already exists or table not yet created
            pass


def init_db():
    """Create database tables and default initial seed data if not present."""
    Base.metadata.create_all(bind=engine)
    
    with engine.connect() as conn:
        run_migrations(conn)

    db: Session = SessionLocal()
    try:
        # Check if default demo user exists
        demo_user = db.query(User).filter(User.email == "researcher@resonance-intel.org").first()
        if not demo_user:
            demo_user = User(
                id="usr-demo-001",
                email="researcher@resonance-intel.org",
                hashed_password=get_password_hash("demo123"),
                full_name="Lead Research Auditor",
                role="admin",
                is_active=True,
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            logger.info("Created default demo user: %s", demo_user.email)
        elif not demo_user.hashed_password.startswith("$2"):
            demo_user.hashed_password = get_password_hash("demo123")
            db.commit()

        # Check if default research project exists
        demo_project = db.query(Project).filter(Project.id == "prj-reproducibility-01").first()
        if not demo_project:
            demo_project = Project(
                id="prj-reproducibility-01",
                name="Biomedical & NLP Reproducibility Benchmark",
                description="Investigation of empirical conflicts across foundational transfer learning studies.",
                owner_id=demo_user.id,
            )
            db.add(demo_project)
            db.commit()
            
            member = ProjectMember(
                project_id=demo_project.id,
                user_id=demo_user.id,
                role="owner"
            )
            db.add(member)
            db.commit()
            logger.info("Created default project: %s", demo_project.name)

    except Exception as e:
        db.rollback()
        logger.error("Error during database initialization: %s", e)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
