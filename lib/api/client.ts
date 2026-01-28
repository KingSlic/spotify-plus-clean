const API_BASE = "http://127.0.0.1:5000/api";

/**
 * Fetch all playlists
 */
export async function fetchPlaylists() {
  const res = await fetch(`${API_BASE}/playlists`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch playlists");
  }

  return res.json();
}

/**
 * Fetch a single playlist by ID
 */
export async function fetchPlaylistById(id: string) {
  const res = await fetch(`${API_BASE}/playlists/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

/**
 * Fetch tracks for a playlist
 */
export async function fetchTracksForPlaylist(id: string) {
  const res = await fetch(`${API_BASE}/playlists/${id}/tracks`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

/**
 * Fetch the full track catalog
 */
export async function fetchAllTracks() {
  const res = await fetch(`${API_BASE}/tracks`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}
