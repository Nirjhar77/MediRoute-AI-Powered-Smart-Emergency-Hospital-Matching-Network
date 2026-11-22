import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import DATABASE_URL, FALLBACK_SQLITE_URL

logger = logging.getLogger("mediroute.database")
logging.basicConfig(level=logging.INFO)

active_url = DATABASE_URL
engine = None
is_postgres = False

# Attempt to connect to PostgreSQL
if "postgres" in DATABASE_URL.lower():
    try:
        test_engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 3})
        with test_engine.connect() as conn:
            logger.info(" Connected successfully to PostgreSQL database!")
            engine = test_engine
            is_postgres = True
    except Exception as e:
        logger.warning(
            f"⚠️ PostgreSQL connection to '{DATABASE_URL}' failed: {e}. "
            f"Falling back to high-performance local SQLite database ({FALLBACK_SQLITE_URL})."
        )
        engine = None

if engine is None:
    # Use SQLite fallback
    engine = create_engine(
        FALLBACK_SQLITE_URL,
        connect_args={"check_same_thread": False}
    )
    active_url = FALLBACK_SQLITE_URL
    is_postgres = False

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
