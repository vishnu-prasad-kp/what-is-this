from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import settings, BASE_DIR
from app.database import init_db
from app.routes.analysis import router as analysis_router
from app.routes.history import router as history_router
from app.schemas import StatusResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables exist
    await init_db()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="What Is This? - AI Image Recognition API",
    description="Backend API powered by Groq Llama 3.2 Vision and FastAPI",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded static media
uploads_path = Path(settings.UPLOAD_DIR)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# Include Routers
app.include_router(analysis_router)
app.include_router(history_router)

@app.get("/health")
@app.get("/api/status", response_model=StatusResponse)
async def status_check():
    return StatusResponse(
        status="operational",
        has_groq_key=settings.has_valid_groq_key,
        model=settings.GROQ_MODEL,
        version="1.0.0"
    )

from fastapi import HTTPException
from fastapi.responses import FileResponse

@app.get("/download-apk")
async def download_apk():
    apk_path = Path("uploads/what-is-this-app.apk")
    if not apk_path.exists():
        apk_path = Path("../what-is-this-app.apk")
    if not apk_path.exists():
        raise HTTPException(status_code=404, detail="APK not found")
    return FileResponse(
        str(apk_path),
        media_type="application/vnd.android.package-archive",
        filename="what-is-this-app.apk"
    )

# Locate frontend dist directory if built
dist_path = None
for candidate in [
    BASE_DIR / "dist",
    BASE_DIR.parent / "frontend" / "dist",
    Path("/app/dist"),
    Path("/app/frontend/dist")
]:
    if candidate.exists() and (candidate / "index.html").exists():
        dist_path = candidate
        break

if dist_path:
    assets_path = dist_path / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="spa-assets")

    @app.get("/")
    async def serve_root():
        return FileResponse(str(dist_path / "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Exclude reserved backend prefixes
        if any(full_path.startswith(prefix) for prefix in ["api/", "uploads/", "docs", "openapi.json", "health"]):
            raise HTTPException(status_code=404, detail="Endpoint not found")
        
        target = dist_path / full_path
        if target.is_file():
            return FileResponse(str(target))
        return FileResponse(str(dist_path / "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "message": "Welcome to 'What Is This?' AI Vision API",
            "download_apk": "/download-apk",
            "docs": "/docs",
            "health": "/health",
            "status": "ready"
        }
