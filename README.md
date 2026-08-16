# RenalCare AI

A kidney-stone care companion: upload CT scans for stone analysis, track hydration and
meals, get diet recommendations, monitor recurrence risk, and manage appointments.

React (Vite) frontend + FastAPI backend + SQLite.

## Setup

Requires Node 18+ and Python 3.10+.

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env          # edit with local values as needed
python init_db.py             # creates renal_care.db + seed patient
python main.py                # http://localhost:8001
```

**Frontend** (from repo root, in a second terminal):
```bash
npm install
npm run dev                   # http://localhost:5173
```

Visit `http://localhost:8001/docs` for the FastAPI Swagger UI, and the Vite URL for the
dashboard.

## Project status

This project is being built out in phases — see [`ROADMAP.md`](./ROADMAP.md) for the
full plan, current status, and what's still pending (real CNN scan classifier,
multi-patient auth, LLM-powered health goals, etc).

## Structure

```
renalcare/
├── src/                # React frontend
├── backend/            # FastAPI backend — see backend/README.md
├── ROADMAP.md           # Completion plan and status tracker
```
