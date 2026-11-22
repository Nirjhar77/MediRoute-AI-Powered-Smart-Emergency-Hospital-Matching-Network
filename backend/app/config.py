import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# PostgreSQL Database URL
# Example: postgresql://postgres:postgres@localhost:5432/mediroute
# Or Neon / Supabase: postgresql://user:pass@ep-xyz.region.aws.neon.tech/mediroute?sslmode=require
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/mediroute"
)

# Fallback to local SQLite if PostgreSQL is not currently running locally
FALLBACK_SQLITE_URL = f"sqlite:///{BASE_DIR / 'mediroute.db'}"

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*",
]
