# app/routes/events.py

from flask import Blueprint, request, jsonify
from app.extensions import db
import uuid
from datetime import datetime
from app.models import TrackEvent

events_bp = Blueprint("events", __name__, url_prefix="/api/events")


@events_bp.route("", methods=["POST"])
def record_event():
    data = request.get_json()

    event = TrackEvent(
        id=str(uuid.uuid4()),
        track_id=data["track_id"],
        playlist_id=data.get("playlist_id"),
        event=data["event"],
        position_ms=data.get("position_ms"),
        created_at=datetime.utcnow(),
    )

    db.session.add(event)
    db.session.commit()

    return jsonify({"status": "ok"}), 201
