from flask import Blueprint, jsonify
from app.models import Track

tracks_bp = Blueprint("tracks", __name__)


@tracks_bp.route("", methods=["GET"])
def list_tracks():
    tracks = Track.query.all()
    return jsonify([t.to_dict() for t in tracks])
