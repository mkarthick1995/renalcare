# RenalCare AI — Backend Setup Guide

## Project structure

```
backend/
├── main.py          # FastAPI application with all endpoints
├── database.py      # SQLAlchemy models and database setup
├── schemas.py        # Pydantic request/response models
├── image_utils.py    # Scan analysis (OpenCV heuristic; see ROADMAP.md Phase 3 for CNN upgrade)
├── init_db.py        # Database initialization (seeds patient_demo_001)
├── requirements.txt  # Python dependencies
├── .env               # Environment configuration (local only, gitignored)
└── .env.example       # Template for .env — commit this, never the real .env
```

## Quick start

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\Activate.ps1
pip install -r requirements.txt

cp .env.example .env          # then edit .env with real local values

python init_db.py             # creates renal_care.db + seed patient_demo_001
python main.py                # starts FastAPI on http://localhost:8001
```

API docs (Swagger UI): `http://localhost:8001/docs`

## Frontend integration

CORS is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`

## Current state / known limitations

See `../ROADMAP.md` for the full plan and status. In short, as of this writing:

- **Scan analysis** (`image_utils.py`) uses an OpenCV contour heuristic, not a trained
  model. Phase 3 of the roadmap replaces this with a real CNN classifier trained on a
  public Kaggle CT-kidney dataset.
- **Single hardcoded patient** (`patient_demo_001`, seeded by `init_db.py`) — no login,
  no multi-patient support yet. Phase 4 adds JWT auth and per-user patients.
- **Health Goals** are LLM-powered via Anthropic's API when `ENABLE_LLM_GOALS=true` in
  `.env`, with a free rule-based fallback otherwise. See Phase 5.

## Database schema (key tables)

- **Patient** — id, name, age, gender, bmi, family_history
- **KidneyScan** — id, patient_id, stone_size_mm, location, severity, confidence, stone_type, image_path
- **WaterIntake** — id, patient_id, amount_ml, time, date
- **MealLog** — id, patient_id, meal_type, food_items (JSON), oxalate_level, sodium_mg
- **Appointment** — id, patient_id, appointment_date, appointment_type, doctor_type, status
- **DietRecommendation** — id, stone_type, restricted_foods, recommended_foods, tips

## Environment variables

See `.env.example` for the full list with descriptions. Never commit the real `.env` —
it's gitignored; verify with `git check-ignore -v backend/.env` before adding secrets.

## Troubleshooting

**Port 8001 already in use:**
```bash
# Mac/Linux
lsof -i :8001 && kill -9 <PID>
# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8001).OwningProcess | Stop-Process
```

**Database errors:**
```bash
rm renal_care.db   # delete old database (Windows: del renal_care.db)
python init_db.py  # reinitialize
```

**Import errors:**
```bash
pip install -r requirements.txt --upgrade
```
