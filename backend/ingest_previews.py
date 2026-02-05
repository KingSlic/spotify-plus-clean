import json
from app.extensions import db
from app.models import Track
from app import create_app

MANIFEST_PATH = "preview_manifest.json"


def ingest_previews():
    app = create_app()
    with app.app_context():
        with open(MANIFEST_PATH, "r") as f:
            previews = json.load(f)

        updated = 0
        skipped = 0

        for entry in previews:
            track_id = entry["track_id"]
            preview_url = entry["preview_url"]

            track = Track.query.get(track_id)

            if not track:
                print(f"⚠️ Track not found: {track_id}")
                skipped += 1
                continue

            if track.preview_url:
                print(f"⏭️ Preview already exists for: {track_id}")
                skipped += 1
                continue

            track.preview_url = preview_url
            updated += 1

        db.session.commit()

        print("✅ Preview ingestion complete")
        print(f"   Updated: {updated}")
        print(f"   Skipped: {skipped}")


if __name__ == "__main__":
    ingest_previews()
