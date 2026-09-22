import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from PIL import Image
import io

from app.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

class StorageService:
    @staticmethod
    async def save_upload_image(file: UploadFile) -> tuple[str, Path]:
        filename = file.filename or "upload.jpg"
        ext = Path(filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            ext = ".jpg"

        unique_id = str(uuid.uuid4())
        unique_filename = f"{unique_id}{ext}"
        destination_path = Path(settings.UPLOAD_DIR) / unique_filename

        content = await file.read()
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="Image size exceeds maximum limit of 10MB.")

        # Verify image using Pillow
        try:
            image = Image.open(io.BytesIO(content))
            image.verify()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid or corrupted image file.")

        # Re-open after verify to save cleanly (verify() invalidates image buffer)
        image = Image.open(io.BytesIO(content))
        # Convert RGBA/P to RGB if JPEG
        if ext in {".jpg", ".jpeg"} and image.mode in ("RGBA", "P"):
            image = image.convert("RGB")

        # Resize if overly large (e.g. > 2048px in either dimension) to save tokens/bandwidth
        max_dim = 2048
        if max(image.width, image.height) > max_dim:
            image.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

        image.save(destination_path)
        return unique_filename, destination_path

    @staticmethod
    def get_file_path(filename: str) -> Path:
        return Path(settings.UPLOAD_DIR) / filename

    @staticmethod
    def delete_file(filename: str) -> bool:
        try:
            path = Path(settings.UPLOAD_DIR) / filename
            if path.exists():
                os.remove(path)
                return True
        except Exception:
            pass
        return False

storage_service = StorageService()
