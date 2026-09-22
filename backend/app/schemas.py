from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field

class AnalysisResult(BaseModel):
    name: str = Field(..., description="Name of the identified object")
    confidence: Literal["high", "medium", "low"] = Field(..., description="Confidence level of identification")
    description: str = Field(..., description="Simple explanation of what the object is")
    uses: list[str] = Field(default_factory=list, description="List of common uses")
    important_info: str = Field(..., description="Useful additional information about the object")
    safety_note: Optional[str] = Field(None, description="Safety precautions or warnings if applicable")

class ScanResponse(AnalysisResult):
    id: str
    image_url: str
    created_at: datetime

    class Config:
        from_attributes = True

class HistoryItem(BaseModel):
    id: str
    image_url: str
    name: str
    confidence: str
    description: str
    created_at: datetime

class HistoryListResponse(BaseModel):
    items: list[HistoryItem]
    total: int

class StatusResponse(BaseModel):
    status: str
    has_groq_key: bool
    model: str
    version: str

class QuestionRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500, description="Follow-up question regarding the scanned item")

class QuestionResponse(BaseModel):
    scan_id: str
    question: str
    answer: str

