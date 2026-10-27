import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.prediction import Prediction
from app.services.unet_model import unet_service
from app.api import auth, dashboard, predictions, health

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema is initialized
    print("[Startup] Creating database tables if not exist...")
    Base.metadata.create_all(bind=engine)

    # Seed demo account if not exists
    db = SessionLocal()
    try:
        demo_email = "demo@satellite-lab.org"
        demo_user = db.query(User).filter(User.email == demo_email).first()
        if not demo_user:
            demo_user = User(
                name="Satellite Research Demo",
                email=demo_email,
                password_hash=hash_password("DemoPassword123!"),
                is_active=True,
            )
            db.add(demo_user)
            db.commit()
            print("[Startup] Seeded demo user: demo@satellite-lab.org")
    finally:
        db.close()

    print(f"[Startup] U-Net model readiness: {unet_service.is_loaded}")
    yield
    print("[Shutdown] Cleaning up resources...")

app = FastAPI(
    title="AquaSat AI - Water-Body Detection Platform",
    description="Full-Stack Satellite Remote Sensing Web API powered by a custom U-Net deep learning segmentation architecture.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Uploads directory for image and mask serving
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)

# Mount Frontend Production Build if dist exists
dist_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if dist_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(dist_dir / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API, docs, redoc, uploads to pass through
        if full_path.startswith("api") or full_path.startswith("uploads") or full_path in ["docs", "redoc", "openapi.json"]:
            return None
        file_path = dist_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(dist_dir / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "name": "AquaSat AI Prediction API",
            "status": "online",
            "docs": "/docs",
            "health": "/api/health",
        }
