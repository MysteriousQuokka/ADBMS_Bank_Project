from database import SessionLocal
from models.audit_log_model import AuditLog


def log_action(actor_id, action, entity_type, entity_id=None, details=None):

    db = SessionLocal()

    try:
        log = AuditLog(
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details
        )

        db.add(log)
        db.commit()

    finally:
        db.close()