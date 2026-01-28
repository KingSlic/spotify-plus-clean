from datetime import datetime
import uuid
from app.extensions import db

# ======================
# Association Tables
# ======================


class TrackArtist(db.Model):
    __tablename__ = "track_artists"

    track_id = db.Column(db.String(64), db.ForeignKey("tracks.id"), primary_key=True)
    artist_id = db.Column(db.String(64), db.ForeignKey("artists.id"), primary_key=True)


# ======================
# Core Models
# ======================


class Section(db.Model):
    __tablename__ = "sections"

    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    order = db.Column(db.Integer, nullable=False)
    show_all_href = db.Column(db.String(255))

    playlists = db.relationship(
        "Playlist",
        back_populates="section",
        cascade="all, delete-orphan",
    )


class Playlist(db.Model):
    __tablename__ = "playlists"

    id = db.Column(db.String(100), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))

    section_id = db.Column(
        db.String(50),
        db.ForeignKey("sections.id"),
        nullable=False,
    )

    section = db.relationship(
        "Section",
        back_populates="playlists",
    )

    tracks = db.relationship(
        "PlaylistTrack",
        back_populates="playlist",
        cascade="all, delete-orphan",
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class Artist(db.Model):
    __tablename__ = "artists"

    id = db.Column(
        db.String(64),
        primary_key=True,
        default=lambda: f"artist_{uuid.uuid4().hex[:12]}",
    )
    name = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(500))

    tracks = db.relationship(
        "Track",
        secondary="track_artists",
        back_populates="artists",
    )


class Album(db.Model):
    __tablename__ = "albums"

    id = db.Column(
        db.String(64),
        primary_key=True,
        default=lambda: f"album_{uuid.uuid4().hex[:12]}",
    )
    title = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(500))

    tracks = db.relationship("Track", back_populates="album")


class Track(db.Model):
    __tablename__ = "tracks"

    id = db.Column(db.String(64), primary_key=True)
    title = db.Column(db.String(255), nullable=False)

    duration_ms = db.Column(db.Integer, nullable=False)
    preview_url = db.Column(db.String(512))
    spotify_url = db.Column(db.String(512))

    # Audio / mood features
    energy = db.Column(db.Float)
    valence = db.Column(db.Float)
    tempo = db.Column(db.Float)
    danceability = db.Column(db.Float)
    acousticness = db.Column(db.Float)
    instrumentalness = db.Column(db.Float)
    speechiness = db.Column(db.Float)
    liveness = db.Column(db.Float)
    loudness = db.Column(db.Float)

    album_id = db.Column(db.String(64), db.ForeignKey("albums.id"), nullable=False)
    album = db.relationship("Album", back_populates="tracks")

    artists = db.relationship(
        "Artist",
        secondary="track_artists",
        back_populates="tracks",
    )

    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "duration_ms": self.duration_ms,
            "preview_url": self.preview_url,
            "spotify_url": self.spotify_url,
            "energy": self.energy,
            "valence": self.valence,
            "tempo": self.tempo,
            "danceability": self.danceability,
            "acousticness": self.acousticness,
            "instrumentalness": self.instrumentalness,
            "speechiness": self.speechiness,
            "liveness": self.liveness,
            "loudness": self.loudness,
            "album": (
                {
                    "id": self.album.id,
                    "title": self.album.title,
                }
                if self.album
                else None
            ),
            "artists": [
                {
                    "id": artist.id,
                    "name": artist.name,
                }
                for artist in self.artists
            ],
        }


class PlaylistTrack(db.Model):
    __tablename__ = "playlist_tracks"

    playlist_id = db.Column(
        db.String(64),
        db.ForeignKey("playlists.id"),
        primary_key=True,
    )
    track_id = db.Column(
        db.String(64),
        db.ForeignKey("tracks.id"),
        primary_key=True,
    )

    position = db.Column(db.Integer, nullable=False)
    added_at = db.Column(db.DateTime)
    play_count = db.Column(db.Integer, default=0)
    skip_count = db.Column(db.Integer, default=0)
    last_played_at = db.Column(db.DateTime)

    playlist = db.relationship(
        "Playlist",
        back_populates="tracks",
    )

    track = db.relationship("Track")
