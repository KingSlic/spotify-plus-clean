from flask import Flask
from app.config import Config
from app.extensions import db

from app.routes.artists import artists_bp
from app.routes.albums import albums_bp
from app.routes.tracks import tracks_bp
from app.routes.playlists import playlists_bp
from app.routes.sections import sections_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    app.register_blueprint(artists_bp, url_prefix="/api/artists")
    app.register_blueprint(albums_bp, url_prefix="/api/albums")
    app.register_blueprint(tracks_bp, url_prefix="/api/tracks")
    app.register_blueprint(playlists_bp, url_prefix="/api/playlists")
    app.register_blueprint(sections_bp, url_prefix="/api/sections")

    return app
