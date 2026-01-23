import random

ARTISTS = [
    "Tyler Gray", "Nova Echo", "Midnight Atlas", "Kairo Flux",
    "Luna Vale", "Static Bloom", "Echo Drift", "Neon Rivers",
    "Lowlight Theory", "Signal Coast", "Velour Phase", "Mono City",
    "Daybreak Union", "Afterhours Club", "Focus Mode"
]

def generate_tracks():
    tracks = []
    track_id = 1

    for artist in ARTISTS:
        for i in range(8):  # 15 artists × 8 = 120 tracks
            tracks.append({
                "id": f"t{track_id}",
                "name": f"{artist} Track {i+1}",
                "artist": artist,
                "album": f"{artist} Vol {random.randint(1,3)}",
                "duration_ms": random.randint(150000, 300000),
                "preview_url": None,
                "energy": round(random.uniform(0.1, 0.95), 2),
                "valence": round(random.uniform(0.1, 0.95), 2),
                "tempo": round(random.uniform(80, 160), 1),
                "danceability": round(random.uniform(0.1, 0.95), 2),
                "acousticness": round(random.uniform(0.0, 0.9), 2),
                "instrumentalness": round(random.uniform(0.0, 0.9), 2),
                "speechiness": round(random.uniform(0.01, 0.25), 2),
                "liveness": round(random.uniform(0.05, 0.4), 2),
                "loudness": round(random.uniform(-14, -4), 1),
            })
            track_id += 1

    return tracks
