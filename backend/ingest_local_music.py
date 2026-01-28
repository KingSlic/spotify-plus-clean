from app import create_app
from app.extensions import db
from app.models import Artist, Album, Track
from data.music_catalog import generate_tracks


def ingest():
    print("🎵 Ingesting local music catalog...")

    tracks_data = generate_tracks()

    artist_count = 0
    album_count = 0
    track_count = 0
    link_count = 0

    for t in tracks_data:
        # Artist
        artist = Artist.query.filter_by(name=t["artist"]).first()
        if not artist:
            artist = Artist(name=t["artist"])
            db.session.add(artist)
            artist_count += 1

        # Album
        album_title = t["album"].strip()
        album = Album.query.filter_by(title=album_title).first()
        if not album:
            album = Album(title=t["album"])
            db.session.add(album)
            album_count += 1

        # Track
        track = Track.query.filter_by(id=t["id"]).first()
        if not track:
            track = Track(
                id=t["id"],
                title=t["name"],
                duration_ms=t.get("duration_ms"),
                preview_url=t.get("preview_url"),
                energy=t.get("energy"),
                valence=t.get("valence"),
                tempo=t.get("tempo"),
                danceability=t.get("danceability"),
                loudness=t.get("loudness"),
                acousticness=t.get("acousticness"),
                instrumentalness=t.get("instrumentalness"),
                liveness=t.get("liveness"),
                speechiness=t.get("speechiness"),
                album=album,
            )
            db.session.add(track)
            track_count += 1

        # Artist ↔ Track link
        if artist not in track.artists:
            track.artists.append(artist)
            link_count += 1

    db.session.commit()

    print(f"👤 Artists created: {artist_count}")
    print(f"💿 Albums created: {album_count}")
    print(f"🎵 Tracks created: {track_count}")
    print(f"🔗 Track–Artist links: {link_count}")
    print("✅ Ingestion complete")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        ingest()
