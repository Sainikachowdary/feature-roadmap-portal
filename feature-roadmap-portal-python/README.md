# Feature Request & Public Roadmap Portal

> A full-stack, enterprise-grade customer feedback and product roadmap management platform (Canny / Featurebase alternative) built with **Python (FastAPI)** and **React 18 (Vite)**.

---

## 🌟 Overview & Core Features

FeaturePortal allows SaaS teams to collect customer suggestions, engage users with upvoting and threaded discussions, and display accepted features on a live, **3-column Public Kanban Roadmap**.

### Key Features Checklist
- **🔒 Dual-Token Security & Authentication**:
  - Short-lived JWT Access Token (15 min) + 7-day Long-lived Refresh Token stored in `httpOnly` secure cookies.
  - User signup with simulated Email Verification token flow.
  - Password reset with simulation tokens & token rotation on login.
  - Role-Based Access Control (**RBAC**): `USER` vs `ADMIN`.

- **💡 Feature Request Submission & Feed**:
  - Modal submission with title, category tags (`UI/UX`, `Integrations`, `Performance`, `General`), and rich Markdown description editor with live preview tab.
  - Dynamic feed with sorting (**Trending / Most Upvoted**, **Newest**, **Most Discussed**) and filtering by category and status.

- **⚡ Atomic Upvoting Engine & Optimistic UI**:
  - Atomic database toggling with unique constraints to prevent duplicate votes per user.
  - Instant optimistic UI upvote toggle with automatic state rollback on network failure.
  - Unauthenticated users clicking upvote are prompted with an interactive Auth Modal.

- **💬 Threaded Discussions**:
  - Nested comment threads on feature details page with Markdown rendering support.
  - Author and Admin permission checks for comment deletion.

- **📌 3-Column Public Kanban Roadmap**:
  - Real-time synchronized 3-column Kanban board (`Planned`, `In Progress`, `Completed`).
  - Admin controls to move request statuses directly from the board or admin panel.

- **🔍 Search & System UX**:
  - Debounced full-text search across titles and descriptions.
  - Coss UI design system primitives, dark-mode glassmorphic aesthetics, loading skeletons, and toast alerts.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.14, FastAPI, SQLAlchemy 2.0 (Async), aiosqlite, Pydantic v2, PyJWT, Passlib / Bcrypt.
- **Frontend**: React 18, Vite, Lucide Icons, React Markdown, Axios.
- **Database**: SQLite (Async via `aiosqlite`) / PostgreSQL compatible.

---

## 📁 Project Structure

```
sainika project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py          # Auth endpoints (signup, login, refresh, logout)
│   │   │   ├── posts.py         # Posts, atomic upvoting, search & filters
│   │   │   ├── comments.py      # Threaded comments endpoints
│   │   │   ├── admin.py         # Admin status transitions & RBAC
│   │   │   └── deps.py          # Auth & RBAC dependencies
│   │   ├── core/
│   │   │   ├── config.py        # Environment settings
│   │   │   ├── database.py      # Async SQLAlchemy engine
│   │   │   └── security.py      # Password hashing & JWT tokens
│   │   ├── models/              # User, Post, Upvote, Comment models
│   │   ├── schemas/             # Pydantic v2 validation schemas
│   │   └── main.py              # FastAPI app & CORS middleware
│   ├── tests/
│   │   └── test_api.py          # Pytest automated test suite
│   ├── seed.py                  # Database seed script
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/client.js        # Axios instance with 401 token refresh interceptor
│   │   ├── components/          # Navbar, AuthModal, CreatePostModal, PostCard, KanbanBoard, ThreadedComments, Toast, Skeletons
│   │   ├── context/AuthContext.jsx # Auth state & toast manager
│   │   ├── pages/               # FeedPage, PostDetailPage, AdminPage
│   │   ├── App.jsx
│   │   └── index.css            # Coss UI tokens & CSS styles
│   └── package.json
├── VIDEO_GUIDE.md               # Script & rubric for recording project video
├── .env.example
└── README.md
```

---

## 🚀 Local Installation & Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database seed script (Populates Admin & sample requests)
python seed.py

# Start FastAPI development server
python -m app.main
```
The FastAPI server runs at `http://127.0.0.1:8000`.
Open API interactive docs at `http://127.0.0.1:8000/docs`.

### 2. Run Backend Tests
```bash
python -m pytest tests/test_api.py
```

### 3. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
The React frontend runs at `http://localhost:5173`.

---

## 🔑 Test User Credentials (Populated by Seed)

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@roadmap.com` | `AdminPass123!` | Full RBAC, change post statuses, delete requests & comments |
| **User 1** | `sarah@example.com` | `UserPass123!` | Submit requests, upvote, comment |
| **User 2** | `david@example.com` | `UserPass123!` | Submit requests, upvote, comment |

---

## ⚙️ Environment Variables (`.env.example`)

```env
# Backend Settings
PROJECT_NAME="Feature Request & Public Roadmap Portal"
SECRET_KEY="super-secret-jwt-key-for-feature-roadmap-assessment-2026"
REFRESH_SECRET_KEY="super-secret-refresh-key-for-feature-roadmap-2026"
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
DATABASE_URL="sqlite+aiosqlite:///./roadmap.db"

# Frontend Settings
VITE_API_BASE_URL="http://127.0.0.1:8000/api/v1"
```

---

## 📝 Technical Decisions & Assumptions

1. **Dual-Token Cookie Strategy**: Used short-lived 15-minute access tokens alongside 7-day refresh tokens set in `httpOnly` cookies to protect against XSS and token hijacking.
2. **Atomic Upvoting**: Unique SQL constraints on `(post_id, user_id)` ensure that upvotes are toggled atomically without race conditions.
3. **Optimistic UI Updates**: The frontend immediately updates vote counts and active states on click, performing a silent rollback if the backend request fails.
