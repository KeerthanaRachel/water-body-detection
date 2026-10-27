import os
from pathlib import Path
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    PROJECT_NAME: str = "AquaSat AI - Water Body Segmentation"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-aquasat-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080")) # 7 days
    
    SESSION_COOKIE_NAME: str = os.getenv("SESSION_COOKIE_NAME", "aquasat_session")
    SESSION_COOKIE_SECURE: bool = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"
    SESSION_COOKIE_SAMESITE: str = os.getenv("SESSION_COOKIE_SAMESITE", "lax")
    
    # Database URL: defaults to SQLite for instant zero-config operation, overridable via DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'aquasat.db'}")
    
    # Upload storage paths
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    IMAGES_DIR: Path = UPLOAD_DIR / "images"
    MASKS_DIR: Path = UPLOAD_DIR / "masks"
    OVERLAYS_DIR: Path = UPLOAD_DIR / "overlays"
    
    # U-Net Model Checkpoint
    MODEL_WEIGHTS_DIR: Path = BASE_DIR / "model_weights"
    MODEL_PATH: Path = MODEL_WEIGHTS_DIR / "unet_water_128.keras"
    MODEL_INPUT_SIZE: int = 128
    DECISION_THRESHOLD: float = 0.5
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

settings = Settings()

# Ensure directories exist
settings.IMAGES_DIR.mkdir(parents=True, exist_ok=True)
settings.MASKS_DIR.mkdir(parents=True, exist_ok=True)
settings.OVERLAYS_DIR.mkdir(parents=True, exist_ok=True)
settings.MODEL_WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
