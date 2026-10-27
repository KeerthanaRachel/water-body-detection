from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings
from app.services.unet_model import unet_service

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    db_healthy = False
    try:
        db.execute(text("SELECT 1"))
        db_healthy = True
    except Exception:
        db_healthy = False

    return {
        "status": "online" if db_healthy and unet_service.is_loaded else "degraded",
        "database": "connected" if db_healthy else "disconnected",
        "unet_model": {
            "loaded": unet_service.is_loaded,
            "architecture": "Small U-Net",
            "input_size": settings.MODEL_INPUT_SIZE,
            "input_resolution": f"{settings.MODEL_INPUT_SIZE}x{settings.MODEL_INPUT_SIZE}",
            "decision_threshold": settings.DECISION_THRESHOLD,
            "error": unet_service.load_error,
        },
        "version": "1.0.0",
    }
