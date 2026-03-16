import os
from dotenv import load_dotenv

# Load environment variables
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(BASE_DIR, ".env"))


class Config:
    # =========================
    # DATABASE
    # =========================
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('MYSQL_USER')}:"
        f"{os.getenv('MYSQL_PASSWORD')}@"
        f"{os.getenv('MYSQL_HOST')}/"
        f"{os.getenv('MYSQL_DB')}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # =========================
    # FLASK CORE
    # =========================
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "dev-secret")

    # =========================
    # SESSION / COOKIE SETTINGS
    # =========================
    SESSION_COOKIE_NAME = "cadence_session"
    SESSION_COOKIE_HTTPONLY = True

    # IMPORTANT: required for cross-origin (3000 -> 5000)
    SESSION_COOKIE_SAMESITE = "Lax"

    # Must be False for localhost
    SESSION_COOKIE_SECURE = False

    # Debug friendliness
    PROPAGATE_EXCEPTIONS = True
