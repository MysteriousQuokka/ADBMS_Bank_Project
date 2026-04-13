from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, LargeBinary
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from backend.database import Base
class User(Base):
    __tablename__ = "users"
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bank_id = Column(UUID(as_uuid=True), ForeignKey("bank_details.bank_id"), nullable=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(LargeBinary, nullable=False)
    role = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())