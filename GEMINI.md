# Project Overview: Fish Guide (Monorepo)

"Fish Guide" is a comprehensive application for fishing enthusiasts, featuring a fish encyclopedia, waterbody management, equipment tracking, bite forecasts, and a community forum. The project is structured as a monorepo with distinct workspaces for the backend and frontend.

---

## ⚙️ Backend Workspace (`backend/`)

A high-performance asynchronous REST API.

### Tech Stack
- **Framework:** `aiohttp` (v3.9.3)
- **Database:** `PostgreSQL` via `SQLAlchemy` (v2.0.27) with `asyncpg`
- **Migrations:** `Alembic` (v1.13.1)
- **Validation:** `Marshmallow` + `aiohttp-apispec` (Swagger/OpenAPI)
- **Storage:** S3-compatible (Minio) via `S3Accessor`
- **Linting:** `Ruff`

### Architecture & Conventions
- **Accessor Pattern:** Data access and external services are encapsulated in `Accessor` classes (e.g., `AdminAccessor`, `ForumAccessor`, `WeatherAccessor`) managed by a central `Store` and injected into `app.store`.
- **Async First:** All I/O operations must be `async/await`.
- **Entry Point:** `backend/main.py` bootstraps the application.
- **Config:** Managed via `backend/config.yaml`.
- **Middlewares:** Located in `backend/app/web/mw.py` for handling sessions, authentication, and errors.

---

## 🎨 Frontend Workspace (`frontend/`)

A React-based single-page application with a unique Retro/Pixel-Art aesthetic.

### Tech Stack
- **Framework:** `React` (v19.2) + `Vite`
- **Routing:** `react-router-dom` (v7.13)
- **Styling:** `TailwindCSS` + Vanilla CSS for pixel-art specifics (custom fonts, `image-rendering: pixelated`).
- **Maps:** `Leaflet` + `react-leaflet`.
- **Charts:** `recharts` for bite forecasts.
- **State Management:** Context API (`AuthProvider`, `RecommendationProvider`).

### Architecture & Conventions
- **Visuals:** Heavy use of HTML5 `<canvas>` for background animations (rain, ripples, etc.) integrated into components.
- **Routing:** Pages are in `src/pages/`, components in `src/components/`.
- **API Communication:** Uses `axios` for interacting with the backend.

---

## 🚀 Building and Running

### 0. Infrastructure (Root)
Ensure Docker is installed and run from the root directory to start PostgreSQL and Minio:
```bash
docker-compose up -d
```

### 1. Backend Setup
Requires Python 3.12+.
```bash
cd backend
# Install dependencies
pip install -r requirements.txt
# Run migrations
alembic upgrade head
# Seed data
python load_seed.py
# Start server (default: http://127.0.0.1:8082)
python main.py
```
*API Documentation: `http://127.0.0.1:8082/docs`*

### 2. Frontend Setup
Requires Node.js and npm.
```bash
cd frontend
npm install
npm run dev
```
*Default URL: `http://localhost:5173`*

---

## 🧪 Testing and Quality
- **Backend:** `pytest` from the `backend/` directory.
- **Backend Linting:** `ruff check .`
- **Frontend Linting:** `npm run lint` (ESLint).

---

## 🛠️ Development Guidelines
- **Security:** Never commit `config.yaml` or `.env` files with production secrets.
- **Conventions:** 
  - Backend: Follow the Accessor pattern for all new data-related logic. Inherit from `BaseAccessor`.
  - Frontend: Maintain the pixel-art aesthetic using defined Tailwind utilities and custom CSS filters. Use `ProtectedRoute` for authenticated routes.
- **Database:** Use `alembic revision --autogenerate -m "description"` to create new migrations after model changes.
