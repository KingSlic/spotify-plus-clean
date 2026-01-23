from flask import Blueprint, jsonify
from app.models import Section, Playlist

sections_bp = Blueprint("sections", __name__)

@sections_bp.route("/", methods=["GET"])
def get_sections():
    sections = Section.query.order_by(Section.order).all()

    data = []
    for section in sections:
        playlists = Playlist.query.limit(6).all()  # demo-safe
        data.append({
            "id": section.id,
            "title": section.title,
            "playlists": [
                {
                    "id": p.id,
                    "name": p.name,
                    "description": p.description,
                    "imageUrl": p.image_url,
                }
                for p in playlists
            ],
        })

    return jsonify(data)
