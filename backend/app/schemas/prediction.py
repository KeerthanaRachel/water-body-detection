from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class PredictionBase(BaseModel):
    original_filename: str
    water_percentage: float
    image_width: int
    image_height: int
    processing_time_ms: float
    status: str = "completed"

class PredictionResponse(PredictionBase):
    id: str
    user_id: str
    image_path: str
    mask_path: str
    overlay_path: Optional[str] = None
    created_at: datetime
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PredictionListResponse(BaseModel):
    total: int
    items: List[PredictionResponse]

class DashboardStatsResponse(BaseModel):
    total_predictions: int
    avg_water_percentage: float
    latest_prediction: Optional[PredictionResponse] = None
    recent_predictions: List[PredictionResponse] = []
