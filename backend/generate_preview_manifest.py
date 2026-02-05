import json
from app import create_app
from app.extensions import db
from app.models import Track

OUTPUT_PATH = "preview_manifest.json"
PREVIEW_PREFIX = "/previews/jamendo_"


def generate_manifest():
    app = create_app()
    with app.app_context():
        tracks = Track.query.filter(Track.preview_url.is_(None)).limit(50).all()

        manifest = []

        for i, track in enumerate(tracks, start=1):
            manifest.append(
                {"track_id": track.id, "preview_url": f"{PREVIEW_PREFIX}{i:02d}.mp3"}
            )

        with open(OUTPUT_PATH, "w") as f:
            json.dump(manifest, f, indent=2)

        print(f"✅ Wrote {len(manifest)} preview entries to {OUTPUT_PATH}")


if __name__ == "__main__":
    generate_manifest()
