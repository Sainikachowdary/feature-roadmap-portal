from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.post import Post
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentResponse
from app.api.deps import get_current_user

router = APIRouter(tags=["Threaded Comments"])

async def build_comment_tree(comments: List[Comment]) -> List[CommentResponse]:
    # Group comments by parent_id
    comment_map = {}
    root_comments = []
    
    for c in comments:
        comment_dict = CommentResponse(
            id=c.id,
            post_id=c.post_id,
            user_id=c.user_id,
            parent_id=c.parent_id,
            content=c.content,
            author=c.author,
            created_at=c.created_at,
            updated_at=c.updated_at,
            replies=[]
        )
        comment_map[c.id] = comment_dict
        
    for c in comments:
        c_obj = comment_map[c.id]
        if c.parent_id and c.parent_id in comment_map:
            comment_map[c.parent_id].replies.append(c_obj)
        elif not c.parent_id:
            root_comments.append(c_obj)
            
    return root_comments

@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
async def get_post_comments(post_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Comment).options(selectinload(Comment.author)).where(Comment.post_id == post_id).order_by(Comment.created_at.asc())
    res = await db.execute(stmt)
    comments = res.scalars().all()
    return await build_comment_tree(comments)

@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    post_id: int,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify post exists
    post_stmt = select(Post).where(Post.id == post_id)
    post_res = await db.execute(post_stmt)
    post = post_res.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
        
    # If parent_id specified, check parent exists
    if comment_in.parent_id:
        p_stmt = select(Comment).where(Comment.id == comment_in.parent_id, Comment.post_id == post_id)
        p_res = await db.execute(p_stmt)
        if not p_res.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Parent comment not found.")

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        parent_id=comment_in.parent_id,
        content=comment_in.content
    )
    db.add(comment)
    await db.commit()
    
    # Reload with author
    stmt = select(Comment).options(selectinload(Comment.author)).where(Comment.id == comment.id)
    res = await db.execute(stmt)
    created_comment = res.scalar_one()
    
    return CommentResponse(
        id=created_comment.id,
        post_id=created_comment.post_id,
        user_id=created_comment.user_id,
        parent_id=created_comment.parent_id,
        content=created_comment.content,
        author=created_comment.author,
        created_at=created_comment.created_at,
        updated_at=created_comment.updated_at,
        replies=[]
    )

@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Comment).where(Comment.id == comment_id)
    res = await db.execute(stmt)
    comment = res.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found.")
        
    # Permission check: Author OR Admin
    if comment.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this comment."
        )
        
    await db.delete(comment)
    await db.commit()
    return {"message": "Comment deleted successfully."}
