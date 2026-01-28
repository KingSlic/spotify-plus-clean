from flask import Blueprint, jsonify, request
from app.extensions import db
from app.models import Playlist, Track, PlaylistTrack


playlists_bp = Blueprint("playlists", __name__, url_prefix="/api/playlists")


@playlists_bp.route("", methods=["GET"])
def get_playlists():
    playlists = Playlist.query.all()
    return jsonify(
        [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "section_id": p.section_id,
                "image_url": p.image_url,
            }
            for p in playlists
        ]
    )


@playlists_bp.route("/<playlist_id>", methods=["GET"])
def get_playlist(playlist_id):
    playlist = Playlist.query.get(playlist_id)

    if not playlist:
        return jsonify({"error": "Playlist not found"}), 404

    return (
        jsonify(
            {
                "id": playlist.id,
                "name": playlist.name,
                "description": playlist.description,
                "image_url": playlist.image_url,
                "section_id": playlist.section_id,
                "created_at": (
                    playlist.created_at.isoformat() if playlist.created_at else None
                ),
            }
        ),
        200,
    )


@playlists_bp.route("/<playlist_id>/tracks", methods=["GET"])
def get_playlist_tracks(playlist_id):
    playlist = Playlist.query.get(playlist_id)

    if not playlist:
        return jsonify({"error": "Playlist not found"}), 404

    # Join table stays backend-only
    tracks = [pt.track for pt in playlist.tracks]

    return jsonify([track.to_dict() for track in tracks]), 200


@playlists_bp.route("/<playlist_id>/tracks", methods=["POST"])
def add_track_to_playlist(playlist_id):
    data = request.get_json()

    if not data or "track_id" not in data:
        return jsonify({"error": "track_id is required"}), 400

    playlist = Playlist.query.get(playlist_id)
    if not playlist:
        return jsonify({"error": "Playlist not found"}), 404

    track = Track.query.get(data["track_id"])
    if not track:
        return jsonify({"error": "Track not found"}), 404

    # Prevent duplicates
    existing = PlaylistTrack.query.filter_by(
        playlist_id=playlist_id, track_id=track.id
    ).first()

    if existing:
        return jsonify({"error": "Track already in playlist"}), 409

    playlist_track = PlaylistTrack(
        playlist_id=playlist_id, track_id=track.id, position=len(playlist.tracks)
    )

    db.session.add(playlist_track)
    db.session.commit()

    return (
        jsonify({"message": "Track added to playlist", "track": track.to_dict()}),
        201,
    )


@playlists_bp.route("/<playlist_id>/tracks/<track_id>", methods=["DELETE"])
def remove_track_from_playlist(playlist_id, track_id):
    playlist = Playlist.query.get(playlist_id)
    if not playlist:
        return jsonify({"error": "Playlist not found"}), 404

    playlist_track = PlaylistTrack.query.filter_by(
        playlist_id=playlist_id, track_id=track_id
    ).first()

    if not playlist_track:
        return jsonify({"error": "Track not in playlist"}), 404

    db.session.delete(playlist_track)
    db.session.commit()

    return jsonify({"message": "Track removed from playlist"}), 200
