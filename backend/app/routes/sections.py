from flask import Blueprint, jsonify
from app.models import Section

sections_bp = Blueprint("sections", __name__)

@sections_bp.route("", methods=["GET"])
def list_sections():
    sections = Section.query.order_by(Section.order).all()
    return jsonify([
        {
            "id": s.id,
            "title": s.title,
            "order": s.order,
            "show_all_href": s.show_all_href,
        }
        for s in sections
    ])
