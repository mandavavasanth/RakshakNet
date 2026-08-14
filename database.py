import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'rashaknet_db')
DB_ECHO = os.getenv('DB_ECHO', 'False').lower() in ('true', '1', 't')

postgres_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
sqlite_url = "sqlite:///./rashaknet.db"

# Fallback mechanism: Try PostgreSQL, fallback to SQLite
try:
    # psycopg2 might not be installed, catching any exception
    engine = create_engine(postgres_url, echo=DB_ECHO)
    # Ping the db to check if it's alive
    with engine.connect() as conn:
        pass
    print("Connected to PostgreSQL successfully.")
except Exception as e:
    print(f"PostgreSQL connection failed. Falling back to SQLite. Error: {e}")
    engine = create_engine(
        sqlite_url, connect_args={"check_same_thread": False}, echo=DB_ECHO
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
