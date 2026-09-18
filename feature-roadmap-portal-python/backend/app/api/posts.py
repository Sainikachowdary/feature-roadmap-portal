from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc, asc
from sqlalchemy.orm import selectinload, aliased

from app.core.database import get_db
from app.models.user import User
from app.models.post import Post, Upvote, PostCategory, PostStatus
from app.models.comment import Comment
from app.schemas.post import (
    PostCreate,
    PostUpdate,
    PostResponse,
    UpvoteToggleResponse
)
from app.api.deps import get_current_user, get_current_user_optional

router = APIRouter(prefix="/posts", tags=["Feature Requests"])

async def format_post_response(post: Post, db: AsyncSession, current_user: Optional[User] = None) -> PostResponse:
    # Count upvotes
    uv_stmt = select(func.count(Upvote.id)).where(Upvote.post_id == post.id)
    uv_res = await db.execute(uv_stmt)
    upvote_count = uv_res.scalar_one() or 0
    
    # Count comments
    cm_stmt = select(func.count(Comment.id)).where(Comment.post_id == post.id)
    cm_res = await db.execute(cm_stmt)
    comment_count = cm_res.scalar_one() or 0
    
    # Check user upvoted
    has_upvoted = False
    if current_user:
        check_stmt = select(Upvote).where(Upvote.post_id == post.id, Upvote.user_id == current_user.id)
        check_res = await db.execute(check_stmt)
        has_upvoted = check_res.scalar_one_or_none() is not None

    return PostResponse(
        id=post.id,
        title=post.title,
        description=post.description,
        category=post.category,
        status=post.status,
        author_id=post.author_id,
        author=post.author,
        upvote_count=upvote_count,
        comment_count=comment_count,
        has_upvoted=has_upvoted,
        created_at=post.created_at,
        updated_at=post.updated_at
    )

@router.get("", response_model=List[PostResponse])
async def get_posts_feed(
    search: Optional[str] = Query(None, description="Full-text search query across title & description"),
    category: Optional[PostCategory] = Query(None, description="Filter by Category"),
    status_filter: Optional[PostStatus] = Query(None, alias="status", description="Filter by Status"),
    sort: str = Query("trending", description="Sort by: trending (upvoted), newest, discussed"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = select(Post).options(selectinload(Post.author))
    
    # Filters
    if category:
        query = query.where(Post.category == category)
    if status_filter:
        query = query.where(Post.status == status_filter)
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                Post.title.ilike(search_pattern),
                Post.description.ilike(search_pattern)
            )
        )
        
    posts_res = await db.execute(query)
    posts = posts_res.scalars().all()
    
    # Format & Sort
    formatted_posts = [await format_post_response(p, db, current_user) for p in posts]
    
    if sort == "newest":
        formatted_posts.sort(key=lambda x: x.created_at, reverse=True)
    elif sort == "discussed":
        formatted_posts.sort(key=lambda x: x.comment_count, reverse=True)
    else: # trending / upvoted
        formatted_posts.sort(key=lambda x: (x.upvote_count, x.created_at), reverse=True)
        
    return formatted_posts

@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_in: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = Post(
        title=post_in.title,
        description=post_in.description,
        category=post_in.category,
        status=PostStatus.UNDER_REVIEW,
        author_id=current_user.id
    )
    db.add(post)
    await db.commit()
    
    # Reload with author relationship
    stmt = select(Post).options(selectinload(Post.author)).where(Post.id == post.id)
    res = await db.execute(stmt)
    created_post = res.scalar_one()
    
    return await format_post_response(created_post, db, current_user)

@router.get("/{post_id}", response_model=PostResponse)
async def get_post_detail(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    stmt = select(Post).options(selectinload(Post.author)).where(Post.id == post_id)
    res = await db.execute(stmt)
    post = res.scalar_one_or_none()
    
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature request not found.")
        
    return await format_post_response(post, db, current_user)

@router.post("/{post_id}/vote", response_model=UpvoteToggleResponse)
async def toggle_upvote(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify post exists
    stmt = select(Post).where(Post.id == post_id)
    res = await db.execute(stmt)
    post = res.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feature request not found.")
        
    # Check if existing upvote
    uv_stmt = select(Upvote).where(Upvote.post_id == post_id, Upvote.user_id == current_user.id)
    uv_res = await db.execute(uv_stmt)
    existing_upvote = uv_res.scalar_one_or_none()
    
    if existing_upvote:
        # Atomic pull / delete
        await db.delete(existing_upvote)
        has_upvoted = False
    else:
        # Atomic push / insert
        new_upvote = Upvote(post_id=post_id, user_id=current_user.id)
        db.add(new_upvote)
        has_upvoted = True
        
    await db.commit()
    
    # Get updated total count
    count_stmt = select(func.count(Upvote.id)).where(Upvote.post_id == post_id)
    count_res = await db.execute(count_stmt)
    new_count = count_res.scalar_one() or 0
    
    return UpvoteToggleResponse(
        post_id=post_id,
        has_upvoted=has_upvoted,
        upvote_count=new_count
    )
