from flask import Blueprint, jsonify
from app.models import Playlist

tracks_bp = Blueprint("tracks", __name__)

@tracks_bp.route("/playlist/<playlist_id>", methods=["GET"])
def get_tracks_for_playlist(playlist_id):
    playlist = Playlist.query.get(playlist_id)

    if not playlist:
        return jsonify({"error": "Playlist not found"}), 404

    return jsonify([
        {
            "id": link.track.id,
            "name": link.track.name,
            "durationMs": link.track.duration_ms,
            "previewUrl": link.track.preview_url,
            "spotifyUrl": link.track.spotify_url,
            "energy": link.track.energy,
            "valence": link.track.valence,
            "tempo": link.track.tempo,
            "position": link.position,
            "addedAt": link.added_at,
            "playCount": link.play_count,
            "skipCount": link.skip_count,
            "lastPlayedAt": link.last_played_at,
        }
        for link in playlist.track_links
    ])
