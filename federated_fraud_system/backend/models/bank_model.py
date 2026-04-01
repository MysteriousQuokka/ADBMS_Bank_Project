from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from database import Base

class Bank(Base):
    __tablename__ = "banks"

    bank_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bank_name = Column(String, nullable=False)
    contact_email = Column(String)
    status = Column(String, default="ACTIVE")
    created_at = Column(TIMESTAMP, server_default=func.now())