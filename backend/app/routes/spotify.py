import os
import base64
import time
import secrets
import requests
from urllib.parse import urlencode

from flask import Blueprint, redirect, make_response, request, jsonify, session

spotify_bp = Blueprint("spotify_bp", __name__, url_prefix="/api/spotify")

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE = "https://api.spotify.com/v1"


# ---------------- AUTH HELPERS ---------------- #


def _basic_auth_header():
    auth_str = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    b64 = base64.b64encode(auth_str.encode()).decode()

    return {
        "Authorization": f"Basic {b64}",
        "Content-Type": "application/x-www-form-urlencoded",
    }


def _bearer_header():
    token = session.get("spotify_access_token")

    print("ACCESS TOKEN:", token)

    if not token:
        return None

    return {"Authorization": f"Bearer {token}"}


def _refresh_if_needed():
    access_token = session.get("spotify_access_token")
    refresh_token = session.get("spotify_refresh_token")
    expires_at = session.get("spotify_expires_at")

    if not access_token or not refresh_token or not expires_at:
        return

    if time.time() < (expires_at - 60):
        return

    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    }

    resp = requests.post(SPOTIFY_TOKEN_URL, headers=_basic_auth_header(), data=data)
    token_data = resp.json()

    new_access = token_data.get("access_token")

    if not new_access:
        print("TOKEN REFRESH FAILED:", token_data)
        return

    session["spotify_access_token"] = new_access
    session["spotify_expires_at"] = time.time() + int(
        token_data.get("expires_in", 3600)
    )

    if token_data.get("refresh_token"):
        session["spotify_refresh_token"] = token_data["refresh_token"]

    print("SPOTIFY TOKEN REFRESHED")


def spotify_api_get(path, params=None):

    _refresh_if_needed()

    headers = _bearer_header()

    if not headers:
        return None, (jsonify({"error": "Not authenticated"}), 401)

    url = f"{SPOTIFY_API_BASE}{path}"

    resp = requests.get(url, headers=headers, params=params)

    if not resp.ok:
        try:
            payload = resp.json()
        except Exception:
            payload = {"error": resp.text}

        print("SPOTIFY API ERROR:", payload)

        return None, (jsonify(payload), resp.status_code)

    return resp.json(), None


def spotify_required(endpoint, params=None):

    data, err = spotify_api_get(endpoint, params=params)

    if err:
        print("❌ SPOTIFY CALL FAILED:", endpoint)
        return None, err

    return data, None


# ---------------- LOGIN ---------------- #


@spotify_bp.route("/login")
def login():

    scope = "user-read-private user-read-email playlist-read-private playlist-read-collaborative"

    state = secrets.token_urlsafe(16)
    session["spotify_oauth_state"] = state

    qs = urlencode(
        {
            "response_type": "code",
            "client_id": SPOTIFY_CLIENT_ID,
            "scope": scope,
            "redirect_uri": SPOTIFY_REDIRECT_URI,
            "show_dialog": "true",
            "state": state,
        }
    )

    auth_url = f"{SPOTIFY_AUTH_URL}?{qs}"

    return redirect(auth_url)


@spotify_bp.route("/callback")
def callback():

    code = request.args.get("code")

    if not code:
        return "Authorization failed", 400

    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": SPOTIFY_REDIRECT_URI,
    }

    token_response = requests.post(
        SPOTIFY_TOKEN_URL, headers=_basic_auth_header(), data=data
    )

    token_data = token_response.json()

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in")

    if not access_token:
        return jsonify({"error": "Spotify token exchange failed"}), 500

    session["spotify_access_token"] = access_token
    session["spotify_refresh_token"] = refresh_token
    session["spotify_expires_at"] = time.time() + int(expires_in)

    session.permanent = True
    session.modified = True

    return redirect("http://127.0.0.1:3000/library")


# ---------------- USER ---------------- #


@spotify_bp.route("/me")
def me():

    data, err = spotify_required("/me")

    if err:
        return err

    return jsonify(data)


# ---------------- PLAYLIST LIST ---------------- #


@spotify_bp.route("/playlists")
def playlists():

    me, err = spotify_required("/me")

    if err:
        return err

    playlists = []

    data, err = spotify_required("/me/playlists", params={"limit": 50})

    if err:
        return err

    for p in data.get("items", []):

        images = p.get("images") or []

        playlists.append(
            {
                "id": p.get("id"),
                "name": p.get("name"),
                "tracks_total": p.get("tracks", {}).get("total"),
                "image": images[0]["url"] if images else None,
            }
        )

    return jsonify({"playlists": playlists})


# ---------------- PLAYLIST TRACKS ---------------- #


@spotify_bp.route("/playlists/<playlist_id>/tracks")
def playlist_tracks(playlist_id):

    all_items = []
    offset = 0
    limit = 100

    while True:

        data, err = spotify_api_get(
            f"/playlists/{playlist_id}/items", params={"limit": limit, "offset": offset}
        )

        if err:
            return jsonify({"tracks": []})

        items = data.get("items", [])

        print("RAW TRACK COUNT:", len(items))

        all_items.extend(items)

        if not data.get("next"):
            break

        offset += limit

    print("TOTAL ITEMS:", len(all_items))

    normalized = []

    for item in all_items:

        track = item.get("track")

        if not track:
            continue

        album = track.get("album") or {}
        images = album.get("images") or []

        normalized.append(
            {
                "id": track.get("id"),
                "name": track.get("name"),
                "artists": ", ".join(a["name"] for a in track.get("artists", [])),
                "album": album.get("name"),
                "duration_ms": track.get("duration_ms"),
                "preview_url": track.get("preview_url"),
                "image": images[0]["url"] if images else None,
            }
        )

    print("NORMALIZED TRACK COUNT:", len(normalized))

    return jsonify({"tracks": normalized, "total": len(normalized)})


# ---------------- DEBUG ---------------- #


@spotify_bp.route("/debug-session")
def debug_session():

    return {
        "session_keys": list(session.keys()),
        "has_token": bool(session.get("spotify_access_token")),
    }
