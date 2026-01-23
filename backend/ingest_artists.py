import os
import requests
from app import create_app, db
from app.models import Artist, Album, Track, TrackArtist
from dotenv import load_dotenv

load_dotenv()

SPOTIFY_TOKEN = os.getenv("SPOTIFY_TOKEN")
HEADERS = {"Authorization": f"Bearer {SPOTIFY_TOKEN}"}

ARTIST_IDS = [
    # hip hop / pop / electronic / focus / gym-safe mix
    "3TVXtAsR1Inumwj472S9r4",  # Drake
    "1Xyo4u8uXC1ZmMpatF05PJ",  # The Weeknd
    "6qqNVTkY8uBg9cP3Jd7DAH",  # Billie Eilish
    "0Y5tJX1MQlPlqiwlOH1tJY",  # Travis Scott
    "246dkjvS1zLTtiykXe5h60",  # Post Malone
    "1uNFoZAHBGtllmzznpCI3s",  # Justin Bieber
    "2YZyLoL8N0Wb9xBt1NhZWg",  # Kendrick Lamar
    "5pKCCKE2ajJHZ9KAiaK11H",  # Rihanna
    "66CXWjxzNUsdJxJ2JdwvnR",  # Ariana Grande
    "4gzpq5DPGxSnKTe4SA8HAU",  # Coldplay
]

def fetch(url):
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    return r.json()

def ingest():
    app = create_app()
    with app.app_context():
        for artist_id in ARTIST_IDS:
            artist_data = fetch(f"https://api.spotify.com/v1/artists/{artist_id}")
            artist = Artist.query.get(artist_id)
            if not artist:
                artist = Artist(
                    id=artist_id,
                    name=artist_data["name"],
                    image_url=artist_data["images"][0]["url"] if artist_data["images"] else None,
                )
                db.session.add(artist)

            top_tracks = fetch(
                f"https://api.spotify.com/v1/artists/{artist_id}/top-tracks?market=US"
            )["tracks"]

            for t in top_tracks:
                if not t["preview_url"]:
                    continue

                album_data = t["album"]
                album = Album.query.get(album_data["id"])
                if not album:
                    album = Album(
                        id=album_data["id"],
                        title=album_data["name"],
                        image_url=album_data["images"][0]["url"] if album_data["images"] else None,
                    )
                    db.session.add(album)

                if Track.query.get(t["id"]):
                    continue

                track = Track(
                    id=t["id"],
                    name=t["name"],
                    album_id=album.id,
                    duration_ms=t["duration_ms"],
                    preview_url=t["preview_url"],
                    spotify_url=t["external_urls"]["spotify"],
                )
                db.session.add(track)

                db.session.add(
                    TrackArtist(track_id=track.id, artist_id=artist.id)
                )

            db.session.commit()
            print(f"✅ Ingested tracks for {artist.name}")

        print("🎉 Artist + track ingestion complete.")

if __name__ == "__main__":
    ingest()
