import { Playlist } from "@/lib/types/playlist";
import { Track } from "@/lib/types/track";
import { cookies } from "next/headers";

const API_BASE = "http://127.0.0.1:5000/api";

function authHeaders() {
  const cookieStore = cookies();
  return {
    cookie: cookieStore.toString(),
  };
}

export async function searchAll(query: string) {
  if (!query) {
    return { tracks: [], playlists: [] };
  }

  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Search failed");
  }

  return res.json();
}

/**
 * Fetch Cadence playlists (local DB)
 */
export async function fetchPlaylists(): Promise<Playlist[]> {
  const res = await fetch(`${API_BASE}/playlists`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch playlists");
  }

  const data = await res.json();

  return data.playlists ?? [];
}

export async function getAllPlaylists(): Promise<Playlist[]> {
  return fetchPlaylists();
}

/**
 * Fetch single playlist
 */
export async function fetchPlaylistById(id: string): Promise<Playlist | null> {
  const res = await fetch(`${API_BASE}/playlists/${id}`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) return null;

  const data = await res.json();

  return data.playlist ?? data;
}

/**
 * Fetch tracks for playlist
 */
export async function fetchTracksForPlaylist(
  playlistId: string,
): Promise<Track[]> {
  const res = await fetch(
    `${API_BASE}/spotify/playlists/${playlistId}/tracks`,
    {
      cache: "no-store",
      headers: authHeaders(),
    },
  );

  if (!res.ok) return [];

  const data = await res.json();

  return data.tracks ?? [];
}

/**
 * Fetch homepage sections
 */
export async function fetchSections() {
  const res = await fetch(`${API_BASE}/sections`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!res.ok) {
    console.error("Failed to fetch sections:", res.status, res.statusText);
    throw new Error("Failed to fetch sections");
  }

  const data = await res.json();

  return data.sections ?? [];
}
