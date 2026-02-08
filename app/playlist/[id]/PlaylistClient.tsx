"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";
import { useMemo, useState } from "react";
import TrackTable from "./TrackTable";

type Track = {
  id: string;
  title: string;
  duration_ms: number | null;
  preview_url: string | null;
  album?: { id: string; title: string; image_url?: string | null } | null;
  artists?: { id: string; name: string }[];
};

type Playlist = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  section_id?: string | null;
  type?: string | null;
};

type Mode = "view" | "manage";

const API_BASE = "http://127.0.0.1:5000/api";

export default function PlaylistClient({
  playlist,
  tracks,
}: {
  playlist: Playlist;
  tracks: Track[];
}) {
  const { setQueue } = useAudioPlayer();

  const [mode, setMode] = useState<Mode>("view");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const selectedCount = selected.size;

  const firstPlayable = useMemo(() => {
    return tracks.find((t) => Boolean(t.preview_url)) ?? null;
  }, [tracks]);

  async function handleHeaderPlay() {
    if (!firstPlayable) return;

    const startIndex = tracks.findIndex((t) => t.id === firstPlayable.id);

    await setQueue(tracks, { startIndex, autoplay: true });
  }

  return (
    <div className="p-6 text-white">
      <div className="flex items-end gap-6">
        <div className="h-44 w-44 shrink-0 overflow-hidden rounded-md bg-neutral-800">
          {playlist.image_url ? (
            <img
              src={playlist.image_url}
              alt={playlist.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-500">
              🎵
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="text-xs uppercase tracking-widest text-neutral-400">
            Playlist
          </div>

          <h1 className="mt-2 truncate text-5xl font-extrabold">
            {playlist.name}
          </h1>

          {playlist.description && (
            <p className="mt-2 max-w-2xl text-neutral-300">
              {playlist.description}
            </p>
          )}

          {/* PLAY BUTTON — INLINE SVG + FILTER RESET */}
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleHeaderPlay}
              disabled={!firstPlayable}
              style={{ filter: "none" }}
              className="flex items-center gap-3 rounded-full bg-green-500 px-7 py-3 font-semibold text-white hover:bg-green-400 hover:scale-[1.02] transition disabled:opacity-40"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="#ffffff"
                xmlns="http://www.w3.org/2000/svg"
                style={{ filter: "none" }}
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span style={{ filter: "none", color: "#ffffff" }}>Play</span>
            </button>

            <button
              onClick={() => setMode((m) => (m === "view" ? "manage" : "view"))}
              className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
            >
              {mode === "view" ? "Manage" : "Done"}
            </button>

            <div className="ml-auto text-sm text-neutral-400">
              {tracks.length} songs
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <TrackTable tracks={tracks} />
      </div>
    </div>
  );
}
