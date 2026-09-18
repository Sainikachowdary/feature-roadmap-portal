import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_root():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

@pytest.mark.asyncio
async def test_auth_and_feed_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login as user
        login_resp = await ac.post("/api/v1/auth/login", json={
            "email": "sarah@example.com",
            "password": "UserPass123!"
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get Me
        me_resp = await ac.get("/api/v1/auth/me", headers=headers)
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == "sarah@example.com"

        # 3. Create Feature Request
        create_resp = await ac.post("/api/v1/posts", json={
            "title": "Automated Email Digest for Roadmap Updates",
            "description": "Send weekly emails to upvoters when status changes.",
            "category": "Integrations"
        }, headers=headers)
        assert create_resp.status_code == 201
        post_id = create_resp.json()["id"]

        # 4. Toggle Upvote
        vote_resp = await ac.post(f"/api/v1/posts/{post_id}/vote", headers=headers)
        assert vote_resp.status_code == 200
        assert vote_resp.json()["has_upvoted"] is True
        assert vote_resp.json()["upvote_count"] == 1

        # 5. Add Comment
        comment_resp = await ac.post(f"/api/v1/posts/{post_id}/comments", json={
            "content": "This digest feature would be super valuable!"
        }, headers=headers)
        assert comment_resp.status_code == 201
        assert comment_resp.json()["content"] == "This digest feature would be super valuable!"

@pytest.mark.asyncio
async def test_admin_rbac():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Login as Admin
        admin_login = await ac.post("/api/v1/auth/login", json={
            "email": "admin@roadmap.com",
            "password": "AdminPass123!"
        })
        assert admin_login.status_code == 200
        admin_headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

        # Change post status to Planned
        status_resp = await ac.patch("/api/v1/admin/posts/1/status", json={
            "status": "Planned"
        }, headers=admin_headers)
        assert status_resp.status_code == 200
        assert status_resp.json()["status"] == "Planned"
