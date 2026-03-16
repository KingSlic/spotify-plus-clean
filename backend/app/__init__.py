from dotenv import load_dotenv
import os

load_dotenv()

from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db

# Routes
from app.routes.cadence import cadence_bp
from app.routes.artists import artists_bp
from app.routes.albums import albums_bp
from app.routes.tracks import tracks_bp
from app.routes.playlists import playlists_bp
from app.routes.sections import sections_bp
from app.routes.search import search_bp
from app.routes.spotify import spotify_bp


def create_app():
    app = Flask(__name__)

    # =========================
    # Load config
    # =========================
    app.config.from_object(Config)
    app.config["PERMANENT_SESSION_LIFETIME"] = 86400  # 1 day in seconds

    # =========================
    # REQUIRED for Flask sessions
    # =========================
    app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret")

    app.config.update(
        SESSION_COOKIE_NAME="cadence_session",
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",  # REQUIRED for cross-origin
        SESSION_COOKIE_SECURE=False,  # must be False for localhost
        SESSION_PERMANENT=True,  # session cookie will persist until browser is closed
        PERMANENT_SESSION_LIFETIME=86400,  # 1 day in seconds (adjust as needed)
    )

    # =========================
    # CORS (required for Next.js frontend)
    # =========================
    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://127.0.0.1:3000"]}},
        supports_credentials=True,
    )

    # =========================
    # Initialize extensions
    # =========================
    db.init_app(app)

    # =========================
    # Register API routes
    # =========================
    app.register_blueprint(artists_bp, url_prefix="/api/artists")
    app.register_blueprint(albums_bp, url_prefix="/api/albums")
    app.register_blueprint(tracks_bp, url_prefix="/api/tracks")
    app.register_blueprint(playlists_bp, url_prefix="/api/playlists")
    app.register_blueprint(sections_bp, url_prefix="/api/sections")
    app.register_blueprint(search_bp, url_prefix="/api/search")
    app.register_blueprint(spotify_bp, url_prefix="/api/spotify")

    # Cadence engine
    app.register_blueprint(cadence_bp)

    return app
