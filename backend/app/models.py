from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# ======================
# Association Table
# ======================


class TrackArtist(db.Model):
    __tablename__ = "track_artists"

    track_id = db.Column(db.String(50), db.ForeignKey("tracks.id"), primary_key=True)
    artist_id = db.Column(db.String(50), db.ForeignKey("artists.id"), primary_key=True)


# ======================
# Core Models
# ======================


class Section(db.Model):
    __tablename__ = "sections"

    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    order = db.Column(db.Integer, nullable=False)
    show_all_href = db.Column(db.String(255))

    # Optional: future-proofing
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)


class Artist(db.Model):
    __tablename__ = "artists"

    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(500))

    tracks = db.relationship(
        "Track",
        secondary="track_artists",
        back_populates="artists",
    )


class Album(db.Model):
    __tablename__ = "albums"

    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(500))

    tracks = db.relationship("Track", back_populates="album")


class Track(db.Model):
    __tablename__ = "tracks"

    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(255), nullable=False)

    album_id = db.Column(db.String(50), db.ForeignKey("albums.id"), nullable=False)
    duration_ms = db.Column(db.Integer, nullable=False)
    preview_url = db.Column(db.String(500))
    spotify_url = db.Column(db.String(500))

    energy = db.Column(db.Float)
    valence = db.Column(db.Float)
    tempo = db.Column(db.Float)
    danceability = db.Column(db.Float)
    acousticness = db.Column(db.Float)
    instrumentalness = db.Column(db.Float)
    speechiness = db.Column(db.Float)
    liveness = db.Column(db.Float)
    loudness = db.Column(db.Float)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    album = db.relationship("Album", back_populates="tracks")
    artists = db.relationship(
        "Artist",
        secondary="track_artists",
        back_populates="tracks",
    )


class Playlist(db.Model):
    __tablename__ = "playlists"

    id = db.Column(db.String(64), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(
        db.Enum("DailyMix", "Discover", "Radar", "MoodBoard", "Library"),
        nullable=False,
    )
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)


class PlaylistTrack(db.Model):
    __tablename__ = "playlist_tracks"

    playlist_id = db.Column(
        db.String(64), db.ForeignKey("playlists.id"), primary_key=True
    )
    track_id = db.Column(db.String(50), db.ForeignKey("tracks.id"), primary_key=True)

    position = db.Column(db.Integer, nullable=False)
    added_at = db.Column(db.DateTime)
    play_count = db.Column(db.Integer)
    skip_count = db.Column(db.Integer)
    last_played_at = db.Column(db.DateTime)
