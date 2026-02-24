"use client";

import { useEffect, useState } from "react";

type SpotifyUser = {
  display_name: string;
  email: string;
  images?: { url: string }[];
};

type SpotifyPlaylist = {
  id: string;
  name: string;
  images?: { url: string }[];
  tracks: { total: number };
};

const BASE = "http://localhost:5000";

export default function SpotifySection() {
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSpotify() {
      try {
        const meRes = await fetch(`${BASE}/api/spotify/me`, {
          credentials: "include",
        });

        console.log("ME STATUS:", meRes.status);

        if (meRes.status === 401) {
          setUser(null);
          setLoading(false);
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

        const playlistsData = await playlistsRes.json();
        setPlaylists(playlistsData.items || []);
      } catch (err: any) {
        console.error("Spotify fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSpotify();
  }, []);

  if (loading) {
    return (
      <div className="text-neutral-400 text-sm mt-6">
        Checking Spotify connection...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm mt-6">Spotify Error: {error}</div>
    );
  }

  if (!user) {
    return (
      <div className="mt-10">
        <h2 className="text-white text-xl font-semibold mb-4">
          Spotify Integration
        </h2>

        <a
          href={`${BASE}/api/spotify/login`}
          className="bg-green-500 hover:bg-green-400 text-black font-medium px-5 py-2 rounded-full transition"
        >
          Connect Spotify
        </a>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-semibold">
          Connected to Spotify
        </h2>

        <a
          href={`${BASE}/api/spotify/logout`}
          className="text-neutral-400 hover:text-white text-sm underline"
        >
          Disconnect
        </a>
      </div>

      <div className="flex items-center gap-4 mb-8">
        {user.images?.[0]?.url && (
          <img
            src={user.images[0].url}
            alt="Spotify Profile"
            className="w-16 h-16 rounded-full"
          />
        )}

        <div>
          <div className="text-white font-medium">{user.display_name}</div>
          <div className="text-neutral-400 text-sm">{user.email}</div>
        </div>
      </div>

      <h3 className="text-white text-lg font-semibold mb-4">
        Your Spotify Playlists
      </h3>

      {playlists.length === 0 ? (
        <div className="text-neutral-400 text-sm">No playlists found.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-neutral-900 rounded-lg p-4 hover:bg-neutral-800 transition"
            >
              {playlist.images?.[0]?.url && (
                <img
                  src={playlist.images[0].url}
                  alt={playlist.name}
                  className="w-full aspect-square object-cover rounded-md mb-3"
                />
              )}

              <div className="text-white font-medium text-sm truncate">
                {playlist.name}
              </div>

              <div className="text-neutral-400 text-xs">
                {playlist.tracks.total} tracks
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
