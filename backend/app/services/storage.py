import uuid
from pathlib import Path
from PIL import Image
from app.core.config import settings

class StorageService:
    @staticmethod
    def save_image(image: Image.Image, prefix: str = "img") -> tuple[str, Path]:
        """Saves a PIL Image to the images directory with a unique UUID filename."""
        filename = f"{prefix}_{uuid.uuid4().hex}.png"
        file_path = settings.IMAGES_DIR / filename
        image.save(file_path, format="PNG")
        url_path = f"/uploads/images/{filename}"
        return url_path, file_path

    @staticmethod
    def save_mask(mask_image: Image.Image) -> tuple[str, Path]:
        """Saves a binary mask PIL Image to the masks directory."""
        filename = f"mask_{uuid.uuid4().hex}.png"
        file_path = settings.MASKS_DIR / filename
        mask_image.save(file_path, format="PNG")
        url_path = f"/uploads/masks/{filename}"
        return url_path, file_path

    @staticmethod
    def save_overlay(overlay_image: Image.Image) -> tuple[str, Path]:
        """Saves a composite overlay PIL Image."""
        filename = f"overlay_{uuid.uuid4().hex}.png"
        file_path = settings.OVERLAYS_DIR / filename
        overlay_image.save(file_path, format="PNG")
        url_path = f"/uploads/overlays/{filename}"
        return url_path, file_path

    @staticmethod
    def delete_file(url_or_relative_path: str):
        """Safely removes a stored image from the uploads directory."""
        if not url_or_relative_path:
            return
        clean_path = url_or_relative_path.lstrip("/")
        if clean_path.startswith("uploads/"):
            rel = clean_path.replace("uploads/", "", 1)
            target = settings.UPLOAD_DIR / rel
            if target.exists() and target.is_file():
                try:
                    target.unlink()
                except OSError:
                    pass

storage_service = StorageService()
