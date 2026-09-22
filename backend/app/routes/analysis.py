import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, ScanRecord
from app.schemas import ScanResponse, QuestionRequest, QuestionResponse
from app.services.ai_service import ai_service
from app.services.storage_service import storage_service

router = APIRouter(prefix="/api", tags=["Analysis"])

@router.post("/analyze", response_model=ScanResponse)
async def analyze_image_endpoint(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    # 1. Validate & Save Image
    try:
        unique_filename, saved_path = await storage_service.save_upload_image(file)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")

    # 2. Call AI Vision Service
    try:
        analysis = await ai_service.analyze_image(saved_path)
    except Exception as e:
        # Cleanup uploaded file if AI analysis fails critically
        storage_service.delete_file(unique_filename)
        raise HTTPException(status_code=500, detail=f"AI Vision Analysis failed: {str(e)}")

    # 3. Save to SQLite Database
    scan_id = str(uuid.uuid4())
    record = ScanRecord(
        id=scan_id,
        image_filename=unique_filename,
        name=analysis.name,
        confidence=analysis.confidence,
        description=analysis.description,
        important_info=analysis.important_info,
        safety_note=analysis.safety_note,
        created_at=datetime.now(timezone.utc)
    )
    record.uses = analysis.uses

    db.add(record)
    await db.commit()
    await db.refresh(record)

    base_url = str(request.base_url).rstrip("/")
    image_url = f"{base_url}/uploads/{unique_filename}"

    return ScanResponse(
        id=record.id,
        image_url=image_url,
        name=record.name,
        confidence=record.confidence,
        description=record.description,
        uses=record.uses,
        important_info=record.important_info,
        safety_note=record.safety_note,
        created_at=record.created_at
    )

@router.get("/scans/{scan_id}", response_model=ScanResponse)
async def get_scan_endpoint(
    scan_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ScanRecord).where(ScanRecord.id == scan_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")

    base_url = str(request.base_url).rstrip("/")
    image_url = f"{base_url}/uploads/{record.image_filename}"

    return ScanResponse(
        id=record.id,
        image_url=image_url,
        name=record.name,
        confidence=record.confidence,
        description=record.description,
        uses=record.uses,
        important_info=record.important_info,
        safety_note=record.safety_note,
        created_at=record.created_at
    )

@router.post("/scans/{scan_id}/ask", response_model=QuestionResponse)
async def ask_scan_question_endpoint(
    scan_id: str,
    payload: QuestionRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ScanRecord).where(ScanRecord.id == scan_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Scan record not found")

    answer = await ai_service.ask_followup(record, payload.question)
    return QuestionResponse(
        scan_id=record.id,
        question=payload.question,
        answer=answer
    )

