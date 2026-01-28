from flask import Blueprint, jsonify
from app.models import Artist

artists_bp = Blueprint("artists", __name__)

@artists_bp.route("", methods=["GET"])
def list_artists():
    artists = Artist.query.all()
    return jsonify([
        {
            "id": a.id,
            "name": a.name,
            "image_url": a.image_url,
        }
        for a in artists
    ])
