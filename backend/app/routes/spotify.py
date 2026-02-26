import os
import base64
import time
import secrets
import requests
from urllib.parse import urlencode

from flask import Blueprint, redirect, request, jsonify, session

spotify_bp = Blueprint("spotify_bp", __name__)

CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE = "https://api.spotify.com/v1"


def _basic_auth_header():
    auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
    b64 = base64.b64encode(auth_str.encode()).decode()
    return {
        "Authorization": f"Basic {b64}",
        "Content-Type": "application/x-www-form-urlencoded",
    }


def _bearer_header():
    token = session.get("spotify_access_token")
    if not token:
        return None
    return {"Authorization": f"Bearer {token}"}


def _refresh_if_needed():
    """
    Refresh access token if expired (or about to expire).
    Safe no-op if we don't have refresh token / expiry.
    """
    access_token = session.get("spotify_access_token")
    refresh_token = session.get("spotify_refresh_token")
    expires_at = session.get("spotify_expires_at")

    if not access_token or not refresh_token or not expires_at:
        return

    # refresh 60s early
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
        print("REFRESH FAILED:", token_data)
        return

    session["spotify_access_token"] = new_access
    session["spotify_expires_at"] = time.time() + int(
        token_data.get("expires_in", 3600)
    )

    # Sometimes Spotify won't re-send refresh_token on refresh (that's normal)
    if token_data.get("refresh_token"):
        session["spotify_refresh_token"] = token_data["refresh_token"]

    # Keep scope around if present
    if token_data.get("scope"):
        session["spotify_scope"] = token_data["scope"]

    print("SPOTIFY TOKEN REFRESHED")


def spotify_api_get(path, params=None):
    """
    One consistent Spotify GET with:
    - auto refresh
    - clear logging on errors
    """
    _refresh_if_needed()

    headers = _bearer_header()
    if not headers:
        return None, (jsonify({"error": "Not authenticated"}), 401)

    url = f"{SPOTIFY_API_BASE}{path}"
    resp = requests.get(url, headers=headers, params=params)

    if resp.status_code == 429:
        retry_after = resp.headers.get("Retry-After", "2")
        print(f"RATE LIMITED. Retry after {retry_after} seconds.")

        return None, (
            jsonify(
                {
                    "error": {
                        "status": 429,
                        "message": f"Spotify rate limited. Retry after {retry_after} seconds.",
                    }
                }
            ),
            429,
        )

    if not resp.ok:
        try:
            payload = resp.json()
        except Exception:
            payload = {"error": {"status": resp.status_code, "message": resp.text}}

        print("SPOTIFY API ERROR:", payload)
        print("SPOTIFY TOKEN SCOPE (session):", session.get("spotify_scope"))

        return None, (jsonify(payload), resp.status_code)

    return resp.json(), None


@spotify_bp.route("/login")
def login():
    # Force re-consent every time while debugging scopes
    # (so Spotify can't silently reuse old grants)
    scope = "user-read-private user-read-email playlist-read-private playlist-read-collaborative"

    state = secrets.token_urlsafe(16)
    session["spotify_oauth_state"] = state

    qs = urlencode(
        {
            "response_type": "code",
            "client_id": CLIENT_ID,
            "scope": scope,
            "redirect_uri": REDIRECT_URI,
            "show_dialog": "true",
            "state": state,
        }
    )

    auth_url = f"{SPOTIFY_AUTH_URL}?{qs}"
    print("AUTH URL:", auth_url)
    print("REDIRECT_URI:", REDIRECT_URI)
    return redirect(auth_url)


@spotify_bp.route("/logout")
def logout():
    session.pop("spotify_access_token", None)
    session.pop("spotify_refresh_token", None)
    session.pop("spotify_expires_at", None)
    session.pop("spotify_scope", None)
    session.pop("spotify_oauth_state", None)
    return redirect("http://127.0.0.1:3000/library")


@spotify_bp.route("/callback")
def callback():
    # Validate state (prevents weird mismatches)
    state = request.args.get("state")
    expected_state = session.get("spotify_oauth_state")
    if expected_state and state != expected_state:
        return jsonify({"error": "Invalid OAuth state"}), 400

    code = request.args.get("code")
    if not code:
        return jsonify({"error": "No code provided"}), 400

    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
    }

    response = requests.post(SPOTIFY_TOKEN_URL, headers=_basic_auth_header(), data=data)
    token_data = response.json()

    print("FULL TOKEN RESPONSE:", token_data)

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    expires_in = int(token_data.get("expires_in", 3600))
    scope = token_data.get("scope")

    if not access_token:
        return jsonify(token_data), 400

    session["spotify_access_token"] = access_token
    session["spotify_refresh_token"] = refresh_token
    session["spotify_expires_at"] = time.time() + expires_in
    session["spotify_scope"] = scope

    print("TOKEN SCOPE (token response):", scope)

    return redirect("http://127.0.0.1:3000/library")


@spotify_bp.route("/me")
def me():
    data, err = spotify_api_get("/me")
    if err:
        return err
    return jsonify(data)


@spotify_bp.route("/playlists")
def playlists():
    data, err = spotify_api_get("/me/playlists", params={"limit": 50})
    if err:
        return err
    return jsonify(data)


@spotify_bp.route("/playlists/<playlist_id>/tracks")
def playlist_tracks(playlist_id):

    # 2) Fetch tracks with market + paging
    all_items = []
    offset = 0
    limit = 100

    while True:
        data, err = spotify_api_get(
            f"/playlists/{playlist_id}/tracks",
            params={"limit": limit, "offset": offset, "market": "from_token"},
        )
        if err:
            return err

        items = data.get("items", [])
        all_items.extend(items)

        if data.get("next"):
            offset += limit
        else:
            total = data.get("total", len(all_items))
            break

    # 3) Normalize
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
                "artists": ", ".join(
                    [a.get("name", "") for a in (track.get("artists") or [])]
                ),
                "album": album.get("name"),
                "duration_ms": track.get("duration_ms"),
                "preview_url": track.get("preview_url"),
                "image": images[0]["url"] if images else None,
            }
        )

    return jsonify({"tracks": normalized, "total": total})
