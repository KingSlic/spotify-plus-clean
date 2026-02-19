# backend/reseed_playlist_tracks.py

from app import create_app
from app.extensions import db
from app.models import Playlist, Track, PlaylistTrack
import random

app = create_app()


def reseed():
    with app.app_context():
        print("🔁 Reseeding playlist_tracks...")

        # Choose playlist (change ID if needed)
        playlist = Playlist.query.filter_by(name="Daily Mix 1").first()

        if not playlist:
            print("❌ Playlist not found")
            return

        # Clear existing memberships
        PlaylistTrack.query.filter_by(playlist_id=playlist.id).delete()
        db.session.commit()

        print(f"🧹 Cleared tracks for playlist: {playlist.name}")

        # Grab tracks to seed (limit to 18 for realism)
        tracks = Track.query.limit(18).all()

        for index, track in enumerate(tracks):
            pt = PlaylistTrack(
                playlist_id=playlist.id, track_id=track.id, position=index
            )
            db.session.add(pt)

        db.session.commit()

        print(f"✅ Added {len(tracks)} tracks to {playlist.name}")


if __name__ == "__main__":
    reseed()



# [<Playlist pl-daily-1>, <Playlist pl-daily-2>, <Playlist pl-discover-weekly>,
# <Playlist pl-gym>, <Playlist pl-late-night>, <Playlist pl-release-radar>]

