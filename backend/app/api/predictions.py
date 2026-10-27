import io
from pathlib import Path
from fastapi import (
    APIRouter, 
    Depends, 
    HTTPException, 
    UploadFile, 
    File, 
    status,
    Query
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from PIL import Image

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.schemas.prediction import PredictionResponse, PredictionListResponse
from app.services.unet_model import unet_service
from app.services.storage import storage_service

router = APIRouter(prefix="/predictions", tags=["Predictions"])

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024 # 20 MB

@router.post("", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def create_prediction(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Validate file extension
    file_ext = Path(file.filename or "").suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format '{file_ext}'. Allowed formats: PNG, JPEG, WebP.",
        )

    # 2. Read bytes and check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed upload size of 20MB.",
        )

    # 3. Validate image integrity with PIL
    try:
        pil_image = Image.open(io.BytesIO(contents))
        pil_image.verify()
        # Re-open after verify() because verify() invalidates the stream
        pil_image = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Corrupted or invalid image file.",
        )

    # 4. Check if U-Net inference engine is ready
    if not unet_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"U-Net inference model is currently unavailable: {unet_service.load_error or 'Initializing'}",
        )

    # 5. Execute actual U-Net model prediction
    try:
        result = unet_service.predict(pil_image)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model inference failed during segmentation: {str(e)}",
        )

    # 6. Save original image, mask, and overlay via storage service
    img_url, _ = storage_service.save_image(pil_image.convert("RGB"), prefix="sat")
    mask_url, _ = storage_service.save_mask(result["binary_mask"])
    overlay_url, _ = storage_service.save_overlay(result["overlay_image"])

    # 7. Record in database
    prediction = Prediction(
        user_id=current_user.id,
        original_filename=file.filename or "satellite_tile.png",
        image_path=img_url,
        mask_path=mask_url,
        overlay_path=overlay_url,
        water_percentage=result["water_percentage"],
        image_width=result["image_width"],
        image_height=result["image_height"],
        processing_time_ms=result["processing_time_ms"],
        status="completed",
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return PredictionResponse.model_validate(prediction)

@router.get("", response_model=PredictionListResponse)
def list_predictions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Prediction).filter(Prediction.user_id == current_user.id)
    total = query.count()
    items = query.order_by(Prediction.created_at.desc()).offset(skip).limit(limit).all()

    return PredictionListResponse(
        total=total,
        items=[PredictionResponse.model_validate(p) for p in items],
    )

@router.get("/{prediction_id}", response_model=PredictionResponse)
def get_prediction(
    prediction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found.",
        )

    # Strict user data isolation check
    if prediction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You do not have permission to view this prediction.",
        )

    return PredictionResponse.model_validate(prediction)

@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prediction(
    prediction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found.",
        )

    # Strict user data isolation check
    if prediction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You do not have permission to delete this prediction.",
        )

    # Delete storage assets
    storage_service.delete_file(prediction.image_path)
    storage_service.delete_file(prediction.mask_path)
    if prediction.overlay_path:
        storage_service.delete_file(prediction.overlay_path)

    # Delete database record
    db.delete(prediction)
    db.commit()

    return None

@router.get("/{prediction_id}/mask")
def download_mask(
    prediction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found.")

    if prediction.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    # Locate mask file
    mask_rel = prediction.mask_path.lstrip("/").replace("uploads/", "")
    mask_file = settings.UPLOAD_DIR / mask_rel

    if not mask_file.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mask file not found on disk.")

    return FileResponse(
        path=mask_file,
        media_type="image/png",
        filename=f"water_mask_{prediction.id[:8]}.png",
    )
