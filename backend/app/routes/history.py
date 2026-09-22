from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, ScanRecord
from app.schemas import HistoryListResponse, HistoryItem
from app.services.storage_service import storage_service

router = APIRouter(prefix="/api/history", tags=["History"])

@router.get("", response_model=HistoryListResponse)
async def get_history_endpoint(
    request: Request,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ScanRecord).order_by(ScanRecord.created_at.desc()).limit(limit)
    result = await db.execute(stmt)
    records = result.scalars().all()

    base_url = str(request.base_url).rstrip("/")
    items = [
        HistoryItem(
            id=rec.id,
            image_url=f"{base_url}/uploads/{rec.image_filename}",
            name=rec.name,
            confidence=rec.confidence,
            description=rec.description,
            created_at=rec.created_at
        )
        for rec in records
    ]

    return HistoryListResponse(items=items, total=len(items))

@router.delete("/{scan_id}")
async def delete_scan_endpoint(
    scan_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ScanRecord).where(ScanRecord.id == scan_id)
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Scan record not found")

    # Delete image file
    storage_service.delete_file(record.image_filename)

    # Delete DB row
    await db.execute(delete(ScanRecord).where(ScanRecord.id == scan_id))
    await db.commit()

    return {"message": "Scan deleted successfully", "id": scan_id}
