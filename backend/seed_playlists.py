from app import create_app
from app.extensions import db
from app.models import Track, Playlist, PlaylistTrack
import random

app = create_app()

TRACKS_PER_PLAYLIST = 20


def f(t, field, default=0.0):
    """Safe float accessor for nullable audio features."""
    v = getattr(t, field, None)
    return v if isinstance(v, (int, float)) else default


PLAYLIST_DEFS = [
    {
        "id": "late_night_focus",
        "name": "Late Night Focus",
        "description": "Calm, low-distraction tracks for late-night concentration",
        "type": "MoodBoard",
        "filter": lambda t: (
            f(t, "energy") < 0.55 and
            f(t, "speechiness") < 0.15
        )
    },
    {
        "id": "chill_evening",
        "name": "Chill Evening",
        "description": "Smooth, relaxed tracks for winding down",
        "type": "MoodBoard",
        "filter": lambda t: (
            f(t, "energy") < 0.6 and
            f(t, "valence") > 0.4
        )
    },
    {
        "id": "deep_work",
        "name": "Deep Work",
        "description": "Instrumental and low-lyric tracks for sustained focus",
        "type": "MoodBoard",
        "filter": lambda t: (
            f(t, "instrumentalness") > 0.25 or
            f(t, "speechiness") < 0.1
        )
    },
    {
        "id": "high_energy",
        "name": "High Energy",
        "description": "Fast-paced tracks to boost energy and momentum",
        "type": "MoodBoard",
        "filter": lambda t: (
            f(t, "energy") > 0.65 and
            f(t, "tempo") > 105
        )
    },
    {
        "id": "gym_session",
        "name": "Gym Session",
        "description": "High-intensity workout music",
        "type": "MoodBoard",
        "filter": lambda t: (
            f(t, "energy") > 0.7 and
            f(t, "tempo") > 115
        )
    },
]

with app.app_context():
    print("🔄 Seeding playlists...")

    all_tracks = Track.query.all()
    random.shuffle(all_tracks)

    used_track_ids = set()

    for spec in PLAYLIST_DEFS:
        print(f"🎧 Building {spec['id']}")

        playlist = db.session.get(Playlist, spec["id"])
        if not playlist:
            playlist = Playlist(
                id=spec["id"],
                name=spec["name"],
                description=spec["description"],
                type=spec["type"],
            )
            db.session.add(playlist)
            db.session.flush()

        PlaylistTrack.query.filter_by(playlist_id=playlist.id).delete()

        eligible = [
            t for t in all_tracks
            if spec["filter"](t) and t.id not in used_track_ids
        ]

        if len(eligible) < TRACKS_PER_PLAYLIST:
            print(
                f"⚠️  {spec['id']} only has {len(eligible)} strict matches — relaxing fallback"
            )
            eligible = [
                t for t in all_tracks
                if t.id not in used_track_ids
            ]

        selected = eligible[:TRACKS_PER_PLAYLIST]

        for idx, track in enumerate(selected, start=1):
            db.session.add(
                PlaylistTrack(
                    playlist_id=playlist.id,
                    track_id=track.id,
                    position=idx,
                )
            )
            used_track_ids.add(track.id)

        print(f"✅ {playlist.name}: {len(selected)} tracks")

    db.session.commit()
    print("🎉 Playlist seeding complete.")
