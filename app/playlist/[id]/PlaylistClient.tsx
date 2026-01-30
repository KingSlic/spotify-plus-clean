// app/playlist/[id]/PlaylistClient.tsx
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
  const { playTrack } = useAudioPlayer();

  const [mode, setMode] = useState<Mode>("view");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const selectedCount = selected.size;

  const firstPlayable = useMemo(() => {
    return tracks.find((t) => !!t.preview_url) ?? null;
  }, [tracks]);

  function toggleSelected(trackId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(tracks.map((t) => t.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function addSelectedToPlaylist() {
    // Minimal: add selected tracks to THIS playlist (idempotent via backend duplicate check)
    // If you later add a “target playlist” picker, this stays the same but the playlist_id changes.
    const ids = Array.from(selected);
    for (const track_id of ids) {
      await fetch(`${API_BASE}/playlists/${playlist.id}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track_id }),
      });
    }
    clearSelection();
  }

  async function removeSelectedFromPlaylist() {
    const ids = Array.from(selected);
    for (const track_id of ids) {
      await fetch(`${API_BASE}/playlists/${playlist.id}/tracks/${track_id}`, {
        method: "DELETE",
      });
    }
    clearSelection();
    // You’ll re-fetch in Phase 2/3; for now, manage mode is mainly UI restoration.
  }

  function handleHeaderPlay() {
    if (!firstPlayable) return;
    playTrack(firstPlayable, { playlistId: playlist.id, queue: tracks });
  }

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex items-end gap-6">
        <div className="h-44 w-44 shrink-0 overflow-hidden rounded-md bg-neutral-800">
          {playlist.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
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
          {playlist.description ? (
            <p className="mt-2 max-w-2xl text-neutral-300">
              {playlist.description}
            </p>
          ) : null}

          {/* Primary actions */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleHeaderPlay}
              className="rounded-full bg-green-500 px-6 py-3 font-semibold text-black hover:bg-green-400 disabled:opacity-40"
              disabled={!firstPlayable}
            >
              Play
            </button>

            <button
              onClick={() => setMode((m) => (m === "view" ? "manage" : "view"))}
              className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
            >
              {mode === "view" ? "Manage" : "Done"}
            </button>

            <div className="ml-auto flex items-center gap-2 text-sm text-neutral-400">
              <span>{tracks.length} songs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-neutral-800 pb-4">
        <button
          onClick={selectAll}
          className="rounded-md border border-neutral-800 px-3 py-2 text-sm hover:bg-neutral-900"
          disabled={tracks.length === 0}
        >
          Select all
        </button>

        <button
          onClick={clearSelection}
          className="rounded-md border border-neutral-800 px-3 py-2 text-sm hover:bg-neutral-900"
          disabled={selectedCount === 0}
        >
          Clear
        </button>

        {mode === "manage" ? (
          <>
            <button
              onClick={addSelectedToPlaylist}
              className="rounded-md bg-neutral-100 px-3 py-2 text-sm font-semibold text-black hover:bg-white disabled:opacity-40"
              disabled={selectedCount === 0}
            >
              Add
            </button>

            <button
              onClick={removeSelectedFromPlaylist}
              className="rounded-md border border-red-700/60 px-3 py-2 text-sm text-red-300 hover:bg-red-900/20 disabled:opacity-40"
              disabled={selectedCount === 0}
            >
              Remove
            </button>
          </>
        ) : (
          <span className="text-sm text-neutral-500">
            Switch to Manage to add/remove.
          </span>
        )}

        <div className="ml-auto text-sm text-neutral-400">
          Selected: {selectedCount}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4">
        <TrackTable
          tracks={tracks}
          selected={selected}
          onToggleSelected={toggleSelected}
          playlistId={playlist.id}
          mode={mode}
        />
      </div>

      {tracks.length === 0 ? (
        <p className="mt-6 text-neutral-400">
          This playlist has no tracks yet.
        </p>
      ) : null}
    </div>
  );
}
