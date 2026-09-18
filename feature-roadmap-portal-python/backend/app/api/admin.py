from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import User
from app.models.post import Post, PostStatus
from app.schemas.post import PostResponse, PostStatusUpdate
from app.api.deps import get_current_admin
from app.api.posts import format_post_response

router = APIRouter(prefix="/admin", tags=["Admin Controls"])

@router.get("/posts", response_model=List[PostResponse])
async def get_all_posts_admin(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    stmt = select(Post).options(selectinload(Post.author)).order_by(Post.created_at.desc())
    res = await db.execute(stmt)
    posts = res.scalars().all()
    return [await format_post_response(p, db, admin) for p in posts]

@router.patch("/posts/{post_id}/status", response_model=PostResponse)
async def update_post_status(
    post_id: int,
    status_update: PostStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    stmt = select(Post).options(selectinload(Post.author)).where(Post.id == post_id)
    res = await db.execute(stmt)
    post = res.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature request not found.")
        
    post.status = status_update.status
    await db.commit()
    await db.refresh(post)
    
    return await format_post_response(post, db, admin)

@router.delete("/posts/{post_id}")
async def delete_post_admin(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    stmt = select(Post).where(Post.id == post_id)
    res = await db.execute(stmt)
    post = res.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature request not found.")
        
    await db.delete(post)
    await db.commit()
    return {"message": "Feature request deleted by Admin successfully."}
