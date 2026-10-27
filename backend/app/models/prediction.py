import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    original_filename = Column(String(255), nullable=False)
    image_path = Column(String(500), nullable=False)
    mask_path = Column(String(500), nullable=False)
    overlay_path = Column(String(500), nullable=True)
    water_percentage = Column(Float, nullable=False)
    image_width = Column(Integer, nullable=False, default=128)
    image_height = Column(Integer, nullable=False, default=128)
    processing_time_ms = Column(Float, nullable=False, default=0.0)
    status = Column(String(20), nullable=False, default="completed")
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    owner = relationship("User", back_populates="predictions")
