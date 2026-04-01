from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from database import Base

class TrainingRound(Base):
    __tablename__ = "training_rounds"

    round_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    model_id = Column(UUID(as_uuid=True), ForeignKey("models.model_id"))

    status = Column(String, default="INITIALIZED")

    total_banks = Column(Integer)      # expected participants
    received_updates = Column(Integer, default=0)

    start_time = Column(TIMESTAMP, server_default=func.now())
    end_time = Column(TIMESTAMP)

    aggregated_model_path = Column(String)