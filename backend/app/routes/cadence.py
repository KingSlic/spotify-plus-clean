# backend/app/routes/cadence.py

from flask import Blueprint, jsonify, request
from app.services.cadence_service import (
    light_touch_reorder,
    playlist_flow_score,
    CadenceWeights,
)
from app.extensions import db
from app.models import PlaylistTrack

cadence_bp = Blueprint("cadence", __name__, url_prefix="/api/cadence")


# -------------------------
# GET Flow Score
# -------------------------


@cadence_bp.route("/score/<playlist_id>", methods=["GET"])
def get_flow_score(playlist_id):
    pts = (
        PlaylistTrack.query.filter_by(playlist_id=playlist_id)
        .order_by(PlaylistTrack.position.asc())
        .all()
    )

    tracks = [pt.track for pt in pts]

    if not tracks:
        return (
            jsonify(
                {
                    "playlist_id": playlist_id,
                    "flow_score": 0.0,
                    "transition_avg": 0.0,
                    "variety_pen": 0.0,
                    "arc_pen": 0.0,
                }
            ),
            200,
        )

    weights = CadenceWeights()
    score_data = playlist_flow_score(tracks, weights)

    return (
        jsonify(
            {
                "playlist_id": playlist_id,
                "flow_score": score_data["overall"],
                "transition_avg": score_data["transition_avg"],
                "variety_pen": score_data["variety_pen"],
                "arc_pen": score_data["arc_pen"],
            }
        ),
        200,
    )


# -------------------------
# POST Reorder (existing)
# -------------------------


@cadence_bp.route("/reorder", methods=["POST"])
def reorder():
    data = request.get_json() or {}
    playlist_id = data.get("playlist_id")

    if not playlist_id:
        return jsonify({"error": "playlist_id is required"}), 400

    seed = data.get("seed")

    proposal = light_touch_reorder(playlist_id, seed=seed)

    # If there is a proposed order, persist it
    proposed_order = proposal.get("proposed_order", [])

    if proposed_order:
        playlist_tracks = PlaylistTrack.query.filter_by(playlist_id=playlist_id).all()

        # Map track_id → PlaylistTrack
        pt_map = {pt.track_id: pt for pt in playlist_tracks}

        for index, track in enumerate(proposed_order):
            track_id = track["id"]
            if track_id in pt_map:
                pt_map[track_id].position = index

        db.session.commit()

    return jsonify(proposal), 200
