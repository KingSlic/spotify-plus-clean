import { Playlist } from "@/lib/types/playlist";
import { Track } from "@/lib/types/track";

const API_BASE = "http://127.0.0.1:5000/api";

export async function searchAll(query: string) {
  if (!query) {
    return { tracks: [], playlists: [] };
  }

  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Search failed");
  }

  return res.json();
}

export async function fetchPlaylists(): Promise<Playlist[]> {
  const res = await fetch(`${API_BASE}/playlists`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch playlists");
  return res.json();
}


export async function getAllPlaylists(): Promise<Playlist[]> {
  return fetchPlaylists();
}

export async function fetchPlaylistById(id: string): Promise<Playlist | null> {
  const res = await fetch(`${API_BASE}/playlists/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

/** ✅ FIXED ENDPOINT */
export async function fetchTracksForPlaylist(
  playlistId: string,
): Promise<Track[]> {
  const res = await fetch(
    `${API_BASE}/playlists/${playlistId}/tracks`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function fetchSections() {
  const res = await fetch(`${API_BASE}/sections`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch sections");
  }

  return res.json();
}
