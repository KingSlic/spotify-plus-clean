from flask import Blueprint, jsonify, request
from app.models import Track
from app.extensions import db

tracks_bp = Blueprint("tracks", __name__, url_prefix="/api/tracks")


@tracks_bp.route("", methods=["GET"])
def list_tracks():
    tracks = Track.query.all()
    return jsonify([t.to_dict() for t in tracks])


@tracks_bp.route("/<track_id>", methods=["PATCH"])
def update_track(track_id):
    track = Track.query.get_or_404(track_id)

    data = request.get_json() or {}

    if "duration_ms" in data:
        track.duration_ms = int(data["duration_ms"])

    if "duration_source" in data:
        track.duration_source = data["duration_source"]

    db.session.commit()

    return jsonify(track.to_dict()), 200
