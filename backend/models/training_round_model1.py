from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from backend.database import Base
class TrainingRound(Base):
    __tablename__ = "training_rounds_details"
    round_number = Column(Integer, primary_key=True, default=0)
    total_banks = Column(Integer)      # expected participants
    aggregated_model_path = Column(String)