from app import create_app
from app.extensions import db
from app.models import Artist, Album, Track, TrackArtist
from data.music_catalog import generate_tracks


def ingest():
    app = create_app()

    with app.app_context():
        print("🎵 Ingesting local music catalog...")

        tracks = generate_tracks()

        artist_map = {}
        album_map = {}

        for t in tracks:
            # ---------- ARTIST ----------
            if t["artist"] not in artist_map:
                artist = Artist(
                    id=t["artist"].lower().replace(" ", "_"),
                    name=t["artist"],
                )
                db.session.add(artist)
                artist_map[t["artist"]] = artist

            # ---------- ALBUM ----------
            album_key = f'{t["artist"]}-{t["album"]}'
            if album_key not in album_map:
                album = Album(
                    id=album_key.lower().replace(" ", "_"),
                    title=t["album"],  # ✅ Album uses title
                )
                db.session.add(album)
                album_map[album_key] = album

            # ---------- TRACK ----------
            track = Track(
                id=t["id"],
                name=t["name"],  # ✅ Track uses name
                album_id=album_map[album_key].id,
                duration_ms=t["duration_ms"],
                preview_url=t["preview_url"],
                energy=t["energy"],
                valence=t["valence"],
                tempo=t["tempo"],
                danceability=t["danceability"],
                acousticness=t["acousticness"],
                instrumentalness=t["instrumentalness"],
                speechiness=t["speechiness"],
                liveness=t["liveness"],
                loudness=t["loudness"],
            )
            db.session.add(track)

            # ---------- TRACK ↔ ARTIST ----------
            db.session.add(
                TrackArtist(
                    track_id=track.id,
                    artist_id=artist_map[t["artist"]].id,
                )
            )

        db.session.commit()
        print(f"✅ Ingested {len(tracks)} tracks")


if __name__ == "__main__":
    ingest()
