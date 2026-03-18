from sqlalchemy import Column, Integer, String, Float, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from database import Base

class Model(Base):
    __tablename__ = "models"

    model_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    version = Column(Integer, nullable=False)
    s3_path = Column(String, nullable=False)
    accuracy = Column(Float)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    status = Column(String, default="PENDING")
    created_at = Column(TIMESTAMP, server_default=func.now())