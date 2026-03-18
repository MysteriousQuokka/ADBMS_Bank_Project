from sqlalchemy import Column, String, Integer, Float, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from database import Base

class ModelUpdate(Base):
    __tablename__ = "model_updates"

    update_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    round_id = Column(UUID(as_uuid=True), ForeignKey("training_rounds.round_id"))
    bank_id = Column(UUID(as_uuid=True), ForeignKey("banks.bank_id"))

    update_s3_path = Column(String, nullable=False)

    samples_used = Column(Integer)
    accuracy_local = Column(Float)

    submitted_at = Column(TIMESTAMP, server_default=func.now())

    status = Column(String, default="SUBMITTED")