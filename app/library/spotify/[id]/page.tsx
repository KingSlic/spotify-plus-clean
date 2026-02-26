"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const BASE = "http://127.0.0.1:5000";

type Track = {
  id: string;
  name: string;
  artists: string;
  album: string;
  duration_ms: number;
  preview_url: string | null;
  image: string | null;
};

export default function SpotifyPlaylistDetail() {
  const params = useParams();
  const playlistId = params?.id as string;

  const [tracks, setTracks] = useState<Track[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!playlistId) return;

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function fetchTracks() {
      try {
        const res = await fetch(
          `${BASE}/api/spotify/playlists/${playlistId}/tracks`,
          { credentials: "include" },
        );

        if (res.status === 401) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch playlist tracks");
        }

        const data = await res.json();
        setTracks(data.tracks || []);
        setTotal(data.total || 0);
      } catch (err: any) {
        console.error("Playlist fetch error:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchTracks();
  }, [playlistId]);

  function formatDuration(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  if (loading) {
    return (
      <div className="mt-8 text-neutral-400 text-sm">Loading playlist...</div>
    );
  }

  if (error) {
    return <div className="mt-8 text-red-400 text-sm">{error}</div>;
  }

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Playlist Tracks</h1>
        <div className="text-neutral-400 text-sm mt-1">{total} tracks</div>
      </div>

      <div className="space-y-1">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="grid grid-cols-[40px_60px_1fr_1fr_80px] items-center gap-4 p-2 rounded hover:bg-neutral-900 transition"
          >
            <div className="text-neutral-500 text-sm">{index + 1}</div>

            {track.image && (
              <img
                src={track.image}
                alt={track.name}
                className="w-12 h-12 object-cover rounded"
              />
            )}

            <div>
              <div className="text-white text-sm font-medium">{track.name}</div>
              <div className="text-neutral-400 text-xs">{track.artists}</div>
            </div>

            <div className="text-neutral-400 text-sm truncate">
              {track.album}
            </div>

            <div className="text-neutral-400 text-sm text-right">
              {formatDuration(track.duration_ms)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
