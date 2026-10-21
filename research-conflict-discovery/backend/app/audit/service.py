from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db.models import AuditEvent


class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        event_type: str,
        target_resource: str,
        user_id: Optional[str] = None,
        project_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
    ) -> AuditEvent:
        """Record an audit event with sensitive field redaction."""
        sanitized_details = {}
        if details:
            for k, v in details.items():
                if any(secret_term in k.lower() for secret_term in ["password", "secret", "token", "key"]):
                    sanitized_details[k] = "[REDACTED]"
                else:
                    sanitized_details[k] = v

        event = AuditEvent(
            user_id=user_id,
            project_id=project_id,
            event_type=event_type,
            target_resource=target_resource,
            details=sanitized_details,
            ip_address=ip_address,
        )
        db.add(event)
        try:
            db.commit()
            db.refresh(event)
        except Exception:
            db.rollback()
        return event
