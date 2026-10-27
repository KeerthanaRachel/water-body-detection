from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.schemas.prediction import DashboardStatsResponse, PredictionResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total user predictions
    total = db.query(func.count(Prediction.id)).filter(Prediction.user_id == current_user.id).scalar() or 0

    # Average water percentage
    avg_pct = db.query(func.avg(Prediction.water_percentage)).filter(Prediction.user_id == current_user.id).scalar() or 0.0

    # Recent predictions
    recent = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .limit(6)
        .all()
    )

    latest = recent[0] if recent else None

    return DashboardStatsResponse(
        total_predictions=total,
        avg_water_percentage=round(avg_pct, 2),
        latest_prediction=PredictionResponse.model_validate(latest) if latest else None,
        recent_predictions=[PredictionResponse.model_validate(p) for p in recent],
    )
