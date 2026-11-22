@echo off
title MediRoute FastAPI Backend
cd /d "%~dp0"

echo ========================================================
echo   Starting MediRoute FastAPI + PostgreSQL Backend
echo ========================================================
echo.

if not exist "venv\Scripts\python.exe" (
    echo [!] Creating Python virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo [!] Installing requirements...
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

echo [*] Launching FastAPI Uvicorn Server at http://localhost:8000
echo [*] Interactive Swagger API Docs at: http://localhost:8000/docs
echo.

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
