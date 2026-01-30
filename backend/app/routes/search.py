from flask import Blueprint, request, jsonify
from app.models import Track, Playlist
from app.extensions import db

search_bp = Blueprint("search", __name__, url_prefix="/api/search")


@search_bp.route("", methods=["GET"])
def search():
    query = request.args.get("q", "").strip()

    if not query:
        return jsonify({"tracks": [], "playlists": []})

    tracks = Track.query.filter(Track.title.ilike(f"%{query}%")).limit(20).all()

    playlists = Playlist.query.filter(Playlist.name.ilike(f"%{query}%")).limit(20).all()

    return jsonify(
        {
            "tracks": [t.to_dict() for t in tracks],
            "playlists": [p.to_dict() for p in playlists],
        }
    )
