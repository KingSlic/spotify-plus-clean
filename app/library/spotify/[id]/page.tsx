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
          setError("Not authenticated with Spotify.");
          setLoading(false);
          return;
        }

        if (res.status === 403) {
          setError("Tracks unavailable via Spotify API.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch playlist tracks.");
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

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="mt-8 space-y-2">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[40px_60px_1fr_1fr_80px] items-center gap-4 p-2"
          >
            <div className="text-neutral-600 text-sm">{i + 1}</div>

            <div className="w-12 h-12 bg-neutral-800 rounded animate-pulse"></div>

            <div className="space-y-2">
              <div className="h-3 w-32 bg-neutral-800 rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-neutral-800 rounded animate-pulse"></div>
            </div>

            <div className="h-3 w-28 bg-neutral-800 rounded animate-pulse"></div>

            <div className="h-3 w-10 bg-neutral-800 rounded animate-pulse ml-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */

  if (error) {
    return (
      <div className="mt-10 text-neutral-400 text-sm">
        {error}
        <div className="text-xs text-neutral-500 mt-2">
          Some Spotify playlists do not allow track access through the API.
        </div>
      </div>
    );
  }

  /* ---------------- EMPTY PLAYLIST ---------------- */

  if (!tracks.length) {
    return (
      <div className="mt-10 text-neutral-400 text-sm">
        This playlist contains no tracks.
      </div>
    );
  }

  /* ---------------- PLAYLIST PAGE ---------------- */

  return (
    <div className="mt-8">
      {/* HEADER */}

      <div className="flex items-end gap-6 mb-8">
        <div className="w-40 h-40 bg-neutral-800 rounded shadow-lg"></div>

        <div>
          <div className="text-sm uppercase text-neutral-400 tracking-wide">
            Playlist
          </div>

          <h1 className="text-4xl font-bold text-white mt-1">
            Playlist Tracks
          </h1>

          <div className="text-neutral-400 text-sm mt-2">{total} songs</div>
        </div>
      </div>

      {/* TABLE HEADER */}

      <div className="grid grid-cols-[40px_60px_1fr_1fr_80px] gap-4 text-neutral-500 text-xs uppercase tracking-wide border-b border-neutral-800 pb-2 mb-2">
        <div>#</div>
        <div></div>
        <div>Title</div>
        <div>Album</div>
        <div className="text-right">Time</div>
      </div>

      {/* TRACKS */}

      <div className="space-y-1">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className="group grid grid-cols-[40px_60px_1fr_1fr_80px] items-center gap-4 p-2 rounded hover:bg-neutral-900 transition cursor-pointer"
          >
            <div className="text-neutral-500 text-sm">{index + 1}</div>

            {track.image ? (
              <img
                src={track.image}
                alt={track.name}
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-neutral-800 rounded"></div>
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
