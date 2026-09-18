import asyncio
import sys

# Ensure UTF-8 stdout on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.post import Post, Upvote, PostCategory, PostStatus
from app.models.comment import Comment

async def seed_data():
    print("[+] Starting database seeding...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if users already exist
        res = await db.execute(select(User))
        existing_users = res.scalars().all()
        if existing_users:
            print("[!] Database already contains data. Skipping seed.")
            return

        print("[+] Creating users (1 Admin + 3 Regular Users)...")
        admin = User(
            email="admin@roadmap.com",
            password_hash=get_password_hash("AdminPass123!"),
            full_name="Alex Vance (Admin)",
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=admin@roadmap.com",
            role=UserRole.ADMIN,
            is_verified=True
        )
        user1 = User(
            email="sarah@example.com",
            password_hash=get_password_hash("UserPass123!"),
            full_name="Sarah Jenkins",
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah@example.com",
            role=UserRole.USER,
            is_verified=True
        )
        user2 = User(
            email="david@example.com",
            password_hash=get_password_hash("UserPass123!"),
            full_name="David Chen",
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=david@example.com",
            role=UserRole.USER,
            is_verified=True
        )
        user3 = User(
            email="elena@example.com",
            password_hash=get_password_hash("UserPass123!"),
            full_name="Elena Rostova",
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=elena@example.com",
            role=UserRole.USER,
            is_verified=True
        )

        db.add_all([admin, user1, user2, user3])
        await db.commit()
        await db.refresh(admin)
        await db.refresh(user1)
        await db.refresh(user2)
        await db.refresh(user3)

        print("[+] Creating sample Feature Requests...")
        p1 = Post(
            title="Dark Mode Support across Dashboard & Portal",
            description="### Objective\nProvide a high-contrast sleek **Dark Theme** to reduce eye strain for developers working at night.\n\n- Support system theme detection (`prefers-color-scheme`)\n- Manual toggle switch in user settings\n- Persist user preference in local storage",
            category=PostCategory.UI_UX,
            status=PostStatus.IN_PROGRESS,
            author_id=user1.id
        )

        p2 = Post(
            title="Slack & Discord Webhook Integration for New Upvotes",
            description="### Summary\nEnable real-time notification alerts sent to team Slack and Discord channels whenever a feature request receives **> 10 upvotes**.\n\n```json\n{\n  \"event\": \"post_trending\",\n  \"upvotes\": 15,\n  \"title\": \"Dark Mode Support\"\n}\n```",
            category=PostCategory.INTEGRATIONS,
            status=PostStatus.PLANNED,
            author_id=user2.id
        )

        p3 = Post(
            title="Optimize Feed Search Indexing & Query Latency",
            description="Improve search speeds by implementing full-text index constraints on `title` and `description` columns to achieve `< 50ms` response times.",
            category=PostCategory.PERFORMANCE,
            status=PostStatus.COMPLETED,
            author_id=admin.id
        )

        p4 = Post(
            title="Export Roadmap Board & Requests to CSV / JSON",
            description="Allow product managers to export all feature suggestions, upvote counts, and comment threads to CSV or JSON format for internal quarterly planning.",
            category=PostCategory.GENERAL,
            status=PostStatus.UNDER_REVIEW,
            author_id=user3.id
        )

        p5 = Post(
            title="Figma Plugin for Direct Requirement Importing",
            description="Build an official Figma widget where designers can push component suggestions directly to this feedback portal.",
            category=PostCategory.INTEGRATIONS,
            status=PostStatus.UNDER_REVIEW,
            author_id=user1.id
        )

        db.add_all([p1, p2, p3, p4, p5])
        await db.commit()
        for p in [p1, p2, p3, p4, p5]:
            await db.refresh(p)

        print("[+] Adding upvotes...")
        upvotes = [
            Upvote(post_id=p1.id, user_id=admin.id),
            Upvote(post_id=p1.id, user_id=user2.id),
            Upvote(post_id=p1.id, user_id=user3.id),
            Upvote(post_id=p2.id, user_id=user1.id),
            Upvote(post_id=p2.id, user_id=user3.id),
            Upvote(post_id=p3.id, user_id=admin.id),
            Upvote(post_id=p3.id, user_id=user1.id),
            Upvote(post_id=p3.id, user_id=user2.id),
            Upvote(post_id=p4.id, user_id=user2.id),
        ]
        db.add_all(upvotes)

        print("[+] Adding threaded comments...")
        c1 = Comment(
            post_id=p1.id,
            user_id=admin.id,
            content="Great request! Our team is currently working on CSS variable tokens to make this seamless.",
            parent_id=None
        )
        db.add(c1)
        await db.commit()
        await db.refresh(c1)

        c2 = Comment(
            post_id=p1.id,
            user_id=user1.id,
            content="Awesome! Looking forward to testing the beta build.",
            parent_id=c1.id
        )
        c3 = Comment(
            post_id=p2.id,
            user_id=user3.id,
            content="Discord webhooks would be super helpful for our community server!",
            parent_id=None
        )
        db.add_all([c2, c3])
        await db.commit()

        print("[SUCCESS] Database seeding completed successfully!")
        print("\nCredentials for Testing:")
        print("   - Admin: admin@roadmap.com / AdminPass123!")
        print("   - User 1: sarah@example.com / UserPass123!")
        print("   - User 2: david@example.com / UserPass123!")

if __name__ == "__main__":
    asyncio.run(seed_data())
