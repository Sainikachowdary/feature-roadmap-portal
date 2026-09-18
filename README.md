# Feature Request & Public Roadmap Portal

A full-stack, enterprise-grade customer feedback and product roadmap management platform (Canny / Featurebase alternative) built with **Python (FastAPI)** and **React 18 (Vite)**.

---

## 🌟 Overview & Core Features

FeaturePortal allows SaaS teams to collect customer suggestions, engage users with upvoting and threaded discussions, and display accepted features on a live, 3-column Public Kanban Roadmap.

### Key Features Checklist

### 🔒 Dual-Token Security & Authentication

* Short-lived **JWT Access Token (15 min)** + **7-day Long-lived Refresh Token** stored in `httpOnly` secure cookies.
* User signup with simulated **Email Verification** token flow.
* Password reset with simulation tokens & token rotation on login.
* **Role-Based Access Control (RBAC):** `USER` vs `ADMIN`.

### 💡 Feature Request Submission & Feed

* Modal submission with title, category tags:

  * UI/UX
  * Integrations
  * Performance
  * General
* Rich Markdown description editor with live preview tab.
* Dynamic feed with sorting:

  * Trending / Most Upvoted
  * Newest
  * Most Discussed
* Filtering by category and status.

### ⚡ Atomic Upvoting Engine & Optimistic UI

* Atomic database toggling with unique constraints to prevent duplicate votes per user.
* Instant optimistic UI upvote toggle with automatic state rollback on network failure.
* Unauthenticated users clicking upvote are prompted with an interactive Auth Modal.

### 💬 Threaded Discussions

* Nested comment threads on feature details page.
* Markdown rendering support.
* Author and Admin permission checks for comment deletion.

### 📌 3-Column Public Kanban Roadmap

* Real-time synchronized 3-column Kanban board:

  * **Planned**
  * **In Progress**
  * **Completed**
* Admin controls to move request statuses directly from the board or admin panel.

### 🔍 Search & System UX

* Debounced full-text search across titles and descriptions.
* Coss UI design system primitives.
* Dark-mode glassmorphic aesthetics.
* Loading skeletons.
* Toast alerts.

---

## 🛠️ Technology Stack

### Backend

* Python 3.14
* FastAPI
* SQLAlchemy 2.0 (Async)
* aiosqlite
* Pydantic v2
* PyJWT
* Passlib / Bcrypt

### Frontend

* React 18
* Vite
* Lucide Icons
* React Markdown
* Axios

### Database

* SQLite (Async via aiosqlite)
* PostgreSQL compatible

---

## 📁 Project Structure

```text
sainika project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py          # Auth endp
```
