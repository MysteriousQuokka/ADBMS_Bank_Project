from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))

    action = Column(String)
    entity_type = Column(String)
    entity_id = Column(UUID(as_uuid=True))

    details = Column(Text)

    created_at = Column(TIMESTAMP, server_default=func.now())