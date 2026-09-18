from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.post import PostCategory, PostStatus
from app.schemas.user import UserResponse

class PostBase(BaseModel):
    title: str
    description: str
    category: PostCategory

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[PostCategory] = None

class PostStatusUpdate(BaseModel):
    status: PostStatus

class PostResponse(PostBase):
    id: int
    status: PostStatus
    author_id: int
    author: UserResponse
    upvote_count: int = 0
    comment_count: int = 0
    has_upvoted: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UpvoteToggleResponse(BaseModel):
    post_id: int
    has_upvoted: bool
    upvote_count: int
