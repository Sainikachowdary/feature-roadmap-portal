from datetime import datetime, timezone
from sqlalchemy import String, Text, ForeignKey, DateTime, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum

class PostCategory(str, enum.Enum):
    UI_UX = "UI/UX"
    INTEGRATIONS = "Integrations"
    PERFORMANCE = "Performance"
    GENERAL = "General"

class PostStatus(str, enum.Enum):
    UNDER_REVIEW = "Under Review"
    PLANNED = "Planned"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[PostCategory] = mapped_column(SQLEnum(PostCategory), default=PostCategory.GENERAL, nullable=False)
    status: Mapped[PostStatus] = mapped_column(SQLEnum(PostStatus), default=PostStatus.UNDER_REVIEW, nullable=False)
    
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    upvotes = relationship("Upvote", back_populates="post", cascade="all, delete-orphan")

class Upvote(Base):
    __tablename__ = "upvotes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    post = relationship("Post", back_populates="upvotes")
    user = relationship("User", back_populates="upvotes")

    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="unique_post_user_upvote"),
    )
