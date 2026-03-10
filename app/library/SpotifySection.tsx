"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SpotifyUser = {
  id: string;
  display_name: string;
  email: string;
  images?: { url: string }[];
};

type NormalizedSpotifyPlaylist = {
  id: string;
  name: string;
  images: { url: string }[];
  trackCount: number;
  owner: string;
};

const BASE = "http://127.0.0.1:5000";

export default function SpotifySection() {
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<
    NormalizedSpotifyPlaylist[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function loadSpotify() {
      try {
        const meRes = await fetch(`${BASE}/api/spotify/me`, {
          credentials: "include",
        });

        if (meRes.status === 401) {
          setUser(null);
          setSpotifyPlaylists([]);
          return;
        }

        if (!meRes.ok) {
          throw new Error("Failed to fetch /me");
        }

        const meData = await meRes.json();
        setUser(meData);

        const playlistsRes = await fetch(`${BASE}/api/spotify/playlists`, {
          credentials: "include",
        });

        if (!playlistsRes.ok) {
          throw new Error("Failed to fetch playlists");
        }

        const data = await playlistsRes.json();

        // 🔧 Handle BOTH possible shapes
        const rawPlaylists = data.items ?? data.playlists ?? [];

        const normalized: NormalizedSpotifyPlaylist[] = rawPlaylists
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            images: p.images || [],
            trackCount: p.tracks?.total ?? p.trackCount ?? 0,
            owner: p.owner?.display_name ?? "Unknown",
          }));

        console.log("Spotify playlists received:", rawPlaylists.length);
        console.log("Owned playlists:", normalized.length);

        setSpotifyPlaylists(normalized);
      } catch (err: any) {
        console.error("Spotify fetch error:", err);
        setError(err.message || "Unknown Spotify error");
      } finally {
        setLoading(false);
      }
    }

    loadSpotify();
  }, []);

  if (loading) {
    return (
      <div className="mt-6 text-sm text-neutral-400">
        Checking Spotify connection...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 text-sm text-red-400">Spotify Error: {error}</div>
    );
  }

  if (!user) {
    return (
      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Spotify Integration
        </h2>

        <a
          href={`${BASE}/api/spotify/login`}
          className="rounded-full bg-green-500 px-5 py-2 font-medium text-black transition hover:bg-green-400"
        >
          Connect Spotify
        </a>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          Connected to Spotify
        </h2>

        <a
          href={`${BASE}/api/spotify/logout`}
          className="text-sm text-neutral-400 underline hover:text-white"
        >
          Disconnect
        </a>
      </div>

      <div className="mb-8 flex items-center gap-4">
        {user.images?.[0]?.url && (
          <img
            src={user.images[0].url}
            alt="Spotify Profile"
            className="h-16 w-16 rounded-full"
          />
        )}

        <div>
          <div className="font-medium text-white">{user.display_name}</div>
          <div className="text-sm text-neutral-400">{user.email}</div>
        </div>
      </div>

      <h3 className="mb-4 text-lg font-semibold text-white">
        Your Spotify Playlists
      </h3>

      {spotifyPlaylists.length === 0 ? (
        <div className="text-sm text-neutral-400">No playlists found.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {spotifyPlaylists.map((playlist) => (
            <Link key={playlist.id} href={`/library/spotify/${playlist.id}`}>
              <div className="cursor-pointer rounded-lg bg-neutral-900 p-4 transition hover:bg-neutral-800">
                <img
                  src={
                    playlist.images?.[0]?.url ||
                    "https://via.placeholder.com/300?text=No+Image"
                  }
                  alt={playlist.name}
                  className="mb-3 aspect-square w-full rounded-md object-cover"
                />

                <div className="truncate text-sm font-medium text-white">
                  {playlist.name}
                </div>

                <div className="text-xs text-neutral-400">
                  {playlist.trackCount} tracks
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
