# Project Explanation Video Script & Checklist

As per **Step 5** of the assessment requirements, you must record a short explanation video (using Loom, YouTube, or Google Drive) demonstrating your project and explaining your technical decisions.

---

## 📹 Video Talking Points & Presentation Outline

### 1. Introduction & Objective (0:00 - 0:45)
- **Introduction**: Introduce yourself and state the project you selected: **Project 01 – Feature Request & Public Roadmap Portal**.
- **Objective**: Explain that this application serves as an interactive SaaS feedback portal (Canny / Featurebase alternative) allowing users to submit feature ideas, upvote suggestions, engage in threaded discussions, and view accepted features on a live **3-Column Public Kanban Roadmap**.

### 2. Technology Stack & Technical Rationale (0:45 - 1:30)
- **Backend**: **Python with FastAPI** and **Async SQLAlchemy 2.0** (`aiosqlite`). Chosen for high async performance, auto-generated OpenAPI Swagger documentation, and clean Pydantic v2 data validation schemas.
- **Frontend**: **React 18 + Vite** styled with **Coss UI primitives** (dark-mode glassmorphism, responsive Kanban board, custom upvote buttons). Chosen for fast build speeds, modular component structure, and smooth optimistic UI rendering.
- **Security**: **Dual-Token JWT Authentication** (15m Short-lived Access Token + 7d Refresh Token in `httpOnly` cookies) with bcrypt password hashing and Role-Based Access Control (**RBAC**).

### 3. Application Demo Walkthrough (1:30 - 3:30)
- **Live Feed & Search**: Show the main feed page, demonstrate debounced search ("Dark Mode"), category filtering (`UI/UX`, `Integrations`, `Performance`), and sorting tabs (**Trending**, **Newest**, **Most Discussed**).
- **Atomic Upvoting & Optimistic UI**: Click the upvote button on a request. Point out how the counter increments instantly on screen (Optimistic UI) and handles atomic toggling without duplicate votes. Show unauthenticated user modal prompt.
- **Submission Modal**: Click "+ Submit Request", show the Markdown editor tab and live Markdown preview tab.
- **Threaded Discussions**: Open a request detail page and demonstrate nested comment replies and author/admin delete permissions.
- **3-Column Public Kanban Roadmap**: Switch to the "Roadmap" tab. Show cards categorized under `Planned`, `In Progress`, and `Completed`.
- **Admin RBAC Controls**: Log in as `admin@roadmap.com`, show the Admin Portal, and demonstrate moving a request's status from `Planned` to `In Progress` or `Completed` and seeing it update real-time on the Kanban board.

### 4. Architecture & Database Design (3:30 - 4:15)
- Explain the relational schema:
  - `User`: Handles credentials, bcrypt hash, role (`USER` vs `ADMIN`), and email verification tokens.
  - `Post`: Stores feature request title, markdown description, category enum, and status enum.
  - `Upvote`: Implements a unique constraint `(post_id, user_id)` for atomic vote toggling.
  - `Comment`: Implements self-referential `parent_id` foreign key for infinite nested comment threads.

### 5. Challenges Faced & Solutions (4:15 - 4:45)
- **Challenge 1: Token Security & Refresh Rotation**: Solved by setting `httpOnly` secure cookies and adding an Axios response interceptor that automatically calls `/api/v1/auth/refresh` on 401 status.
- **Challenge 2: Optimistic Upvoting Rollback**: Solved by holding local state for instant feedback and catching network errors to roll back the state gracefully.

### 6. Video Upload Checklist
- [ ] Ensure video permissions are set to **"Anyone with the link can view"**.
- [ ] Paste the public video link into the Assessment Submission Form.
