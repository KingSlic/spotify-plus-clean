"use client";

import { usePlayback } from "@/app/contexts/PlaybackContext";
import { useMemo, useState } from "react";
import TrackTable from "./TrackTable";

type Track = {
  id: string;
  title: string;
  duration_ms: number | null;
  preview_url: string | null;
  artists?: { id: string; name: string }[];
};

type Playlist = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
};

type Mode = "view" | "manage";

export default function PlaylistClient({
  playlist,
  tracks,
}: {
  playlist: Playlist;
  tracks: Track[];
}) {
  const { setQueue } = usePlayback();

  const [mode, setMode] = useState<Mode>("view");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [stagedSet, setStagedSet] = useState<Set<string>>(
    new Set(tracks.map((t) => t.id)),
  );

  function toggleMembership(id: string) {
    setStagedSet((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  }

  const firstPlayable = useMemo(
    () => tracks.find((t) => t.preview_url),
    [tracks],
  );

  function handleHeaderPlay() {
    if (!firstPlayable) return;
    const startIndex = tracks.findIndex((t) => t.id === firstPlayable.id);
    setQueue(tracks, { startIndex, autoplay: true });
  }

  return (
    <div className="max-w-6xl">
      {/* HEADER */}
      <div className="flex items-end gap-8 mb-10">
        {/* COVER */}
        <div className="h-56 w-56 shrink-0 overflow-hidden rounded-md bg-neutral-800 shadow-lg">
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

        {/* TITLE AREA */}
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-widest text-neutral-400">
            Playlist
          </div>

          <h1 className="mt-3 text-6xl font-extrabold truncate">
            {playlist.name}
          </h1>

          {playlist.description ? (
            <p className="mt-4 text-neutral-400 text-lg">
              {playlist.description}
            </p>
          ) : (
            <p className="mt-4 text-neutral-500 text-lg">
              {tracks.length} songs
            </p>
          )}

          {/* ACTIONS */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleHeaderPlay}
              disabled={!firstPlayable}
              className="flex items-center gap-3 rounded-full bg-green-500 px-8 py-3 font-semibold text-black hover:bg-green-400 transition disabled:opacity-40"
            >
              ▶ Play
            </button>

            <button
              onClick={() => setMode((m) => (m === "view" ? "manage" : "view"))}
              className="rounded-full border border-neutral-700 px-6 py-3 text-sm text-neutral-200 hover:bg-neutral-900 transition"
            >
              {mode === "view" ? "Manage" : "Done"}
            </button>

            <div className="ml-auto text-neutral-400 text-lg">
              {tracks.length} songs
            </div>
          </div>
        </div>
      </div>

      {/* BULK ACTION BAR (RESERVED SPACE — NO SHIFT) */}
      <div className="h-14 mb-4">
        <div
          className={[
            "flex items-center gap-4 transition-all duration-200",
            mode === "manage" && selected.size > 0
              ? "opacity-100"
              : "opacity-0 pointer-events-none",
          ].join(" ")}
        >
          <span className="text-neutral-400 text-sm">
            {selected.size} selected
          </span>

          <button className="rounded bg-neutral-800 px-4 py-2 hover:bg-neutral-700 transition">
            Add selected
          </button>

          <button className="rounded bg-neutral-800 px-4 py-2 hover:bg-neutral-700 transition">
            Remove selected
          </button>
        </div>
      </div>

      {/* TABLE */}
      <TrackTable
        tracks={tracks}
        mode={mode}
        selected={selected}
        setSelected={setSelected}
        stagedSet={stagedSet}
        toggleMembership={toggleMembership}
      />
    </div>
  );
}
