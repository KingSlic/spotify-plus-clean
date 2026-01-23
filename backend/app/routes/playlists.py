from flask import Blueprint, jsonify
from app.models import Playlist

playlists_bp = Blueprint("playlists", __name__)


@playlists_bp.route("/", methods=["GET"])
def get_playlists():
    playlists = Playlist.query.all()

    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "type": p.type,
            "imageUrl": p.image_url,
        }
        for p in playlists
    ])


@playlists_bp.route("/<playlist_id>", methods=["GET"])
def get_playlist_by_id(playlist_id):
    playlist = Playlist.query.get(playlist_id)

    if not playlist:
        return jsonify({"error": "Playlist not found"}), 404

    return jsonify({
        "id": playlist.id,
        "name": playlist.name,
        "description": playlist.description,
        "coverImage": playlist.cover_image,
    })
