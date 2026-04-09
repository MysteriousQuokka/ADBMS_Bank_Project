from sqlalchemy import Column, String, TIMESTAMP, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from sqlalchemy.dialects.postgresql import ARRAY

from backend.database import Base

class Bank(Base):
    __tablename__ = "bank_details"

    bank_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bank_name = Column(String, nullable=False)
    # contact_email = Column(String)
    total_rows = Column(Integer)
    accuracy = Column(Float)
    update_s3_path = Column(String)
    status = Column(String, default="ACTIVE")
    created_at = Column(TIMESTAMP, server_default=func.now())