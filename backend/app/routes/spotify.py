import os
import base64
import requests
from flask import Blueprint, redirect, request, jsonify, session

spotify_bp = Blueprint("spotify_bp", __name__)

CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE = "https://api.spotify.com/v1"


def get_auth_header():
    token = session.get("spotify_access_token")
    if not token:
        return None
    return {"Authorization": f"Bearer {token}"}


# 🔑 LOGIN ROUTE
@spotify_bp.route("/login")
def login():
    scope = "user-read-private user-read-email playlist-read-private"
    auth_url = (
        f"{SPOTIFY_AUTH_URL}"
        f"?response_type=code"
        f"&client_id={CLIENT_ID}"
        f"&scope={scope}"
        f"&redirect_uri={REDIRECT_URI}"
    )
    return redirect(auth_url)


@spotify_bp.route("/logout")
def logout():
    session.pop("spotify_access_token", None)
    return redirect("http://localhost:3000/library")


# 🔁 CALLBACK ROUTE
@spotify_bp.route("/callback")
def callback():
    code = request.args.get("code")

    if not code:
        return jsonify({"error": "No code provided"}), 400

    auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
    b64_auth = base64.b64encode(auth_str.encode()).decode()

    headers = {
        "Authorization": f"Basic {b64_auth}",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
    }

    response = requests.post(SPOTIFY_TOKEN_URL, headers=headers, data=data)
    token_data = response.json()

    access_token = token_data.get("access_token")

    if not access_token:
        return jsonify(token_data), 400

    session["spotify_access_token"] = access_token

    return redirect("http://localhost:3000/library")


# 👤 PROFILE ROUTE
@spotify_bp.route("/me")
def get_profile():
    headers = get_auth_header()
    if not headers:
        return jsonify({"error": "Not authenticated"}), 401

    response = requests.get(f"{SPOTIFY_API_BASE}/me", headers=headers)
    return jsonify(response.json())


# 🎵 PLAYLISTS ROUTE
@spotify_bp.route("/playlists")
def get_playlists():
    headers = get_auth_header()
    if not headers:
        return jsonify({"error": "Not authenticated"}), 401

    response = requests.get(f"{SPOTIFY_API_BASE}/me/playlists", headers=headers)
    return jsonify(response.json())


# 🎧 PLAYLIST TRACKS
@spotify_bp.route("/playlists/<playlist_id>")
def get_playlist_tracks(playlist_id):
    headers = get_auth_header()
    if not headers:
        return jsonify({"error": "Not authenticated"}), 401

    response = requests.get(
        f"{SPOTIFY_API_BASE}/playlists/{playlist_id}/tracks",
        headers=headers,
    )

    return jsonify(response.json())
