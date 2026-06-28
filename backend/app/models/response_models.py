from pydantic import BaseModel
from typing import Optional, Any, Dict, List


# ── Health ──────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str
    version: str
    message: str


# ── Generic API responses ────────────────────────────────
class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    detail: Optional[str] = None


# ── Upload ───────────────────────────────────────────────
class UploadResponse(BaseModel):
    success: bool
    message: str
    filename: Optional[str] = None
    chunks: Optional[int] = None


# ── Chat ─────────────────────────────────────────────────
class ChatResponse(BaseModel):
    answer: str
    sources: Optional[List[Dict[str, Any]]] = None
    session_id: Optional[str] = None


# ── Document ─────────────────────────────────────────────
class DocumentResponse(BaseModel):
    id: str
    filename: str
    status: str
    created_at: Optional[str] = None