from flask import Blueprint, jsonify
from app.models import Album

albums_bp = Blueprint("albums", __name__)

@albums_bp.route("", methods=["GET"])
def list_albums():
    albums = Album.query.all()
    return jsonify([
        {
            "id": a.id,
            "title": a.title,
            "image_url": a.image_url,
        }
        for a in albums
    ])
