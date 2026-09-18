from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse

class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None

class CommentResponse(BaseModel):
    id: int
    post_id: int
    user_id: int
    parent_id: Optional[int] = None
    content: str
    author: UserResponse
    created_at: datetime
    updated_at: datetime
    replies: List[CommentResponse] = []

    model_config = ConfigDict(from_attributes=True)
