from datetime import datetime
import random

from app import create_app
from app.extensions import db
from app.models import Playlist, Track, PlaylistTrack

TRACKS_PER_PLAYLIST = 20


def seed_playlist_tracks():
    playlists = Playlist.query.all()
    tracks = Track.query.all()

    if not playlists or not tracks:
        print("❌ No playlists or tracks found.")
        return

    for playlist in playlists:
        # Clear existing joins (idempotent)
        PlaylistTrack.query.filter_by(playlist_id=playlist.id).delete()

        random.seed(playlist.id)
        selected_tracks = random.sample(tracks, min(TRACKS_PER_PLAYLIST, len(tracks)))

        for position, track in enumerate(selected_tracks):
            pt = PlaylistTrack(
                playlist_id=playlist.id,
                track_id=track.id,
                position=position,
                added_at=datetime.utcnow(),
                play_count=0,
                skip_count=0,
            )
            db.session.add(pt)

        print(f"✅ Seeded {len(selected_tracks)} tracks for {playlist.name}")

    db.session.commit()
    print("🎵 Playlist tracks seeding complete.")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_playlist_tracks()
