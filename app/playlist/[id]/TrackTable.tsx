"use client";

import TrackRow from "@/app/components/TrackRow";
import { usePlayback } from "@/app/contexts/PlaybackContext";
import { useMemo, useState } from "react";

type Track = {
  id: string;
  title: string;
  duration_ms: number | null;
  preview_url: string | null;
  artists?: { id: string; name: string }[];
};

const API_BASE = "http://127.0.0.1:5000/api";

export default function TrackTable({
  tracks,
  playlistId,
}: {
  tracks: Track[];
  playlistId: string;
}) {
  const { onTrackRemoved } = usePlayback();

  const [localTracks, setLocalTracks] = useState<Track[]>(tracks);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkBusy, setIsBulkBusy] = useState(false);

  /* ---------- ADD / REMOVE ---------- */

  async function removeTrack(trackId: string) {
    setLocalTracks((prev) => prev.filter((t) => t.id !== trackId));
    onTrackRemoved(trackId);

    await fetch(`${API_BASE}/playlists/${playlistId}/tracks/${trackId}`, {
      method: "DELETE",
    });
  }

  async function addTrack(track: Track) {
    setLocalTracks((prev) => [...prev, track]);

    await fetch(`${API_BASE}/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ track_id: track.id }),
    });
  }

  /* ---------- SELECTION ---------- */

  const visibleIds = useMemo(() => localTracks.map((t) => t.id), [localTracks]);

  const allSelected =
    selectedIds.size === visibleIds.length && visibleIds.length > 0;
  const noneSelected = selectedIds.size === 0;
  const isIndeterminate = !allSelected && !noneSelected;

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(visibleIds));
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /* ---------- BULK ACTION ---------- */

  const selectedTracks = tracks.filter((t) => selectedIds.has(t.id));
  const anyInPlaylist = selectedTracks.some((t) =>
    localTracks.some((lt) => lt.id === t.id),
  );

  async function handleBulkAction() {
    if (isBulkBusy || selectedTracks.length === 0) return;

    setIsBulkBusy(true);

    try {
      for (const track of selectedTracks) {
        const isInPlaylist = localTracks.some((t) => t.id === track.id);

        if (anyInPlaylist && isInPlaylist) {
          await removeTrack(track.id);
        }

        if (!anyInPlaylist && !isInPlaylist) {
          await addTrack(track);
        }
      }
    } finally {
      setSelectedIds(new Set());
      setIsBulkBusy(false);
    }
  }

  if (localTracks.length === 0) {
    return (
      <p className="mt-6 text-neutral-400">This playlist has no tracks.</p>
    );
  }

  return (
    <>
      {/* BULK ACTION BAR */}
      {!noneSelected && (
        <div className="mb-3 flex items-center gap-4 rounded bg-neutral-800 px-4 py-2 text-sm">
          <span className="text-neutral-300">{selectedIds.size} selected</span>

          <button
            onClick={handleBulkAction}
            disabled={isBulkBusy}
            className="rounded-full bg-green-500 px-4 py-1.5 font-medium text-black hover:bg-green-400 disabled:opacity-40"
          >
            {anyInPlaylist ? "Remove selected" : "Add selected"}
          </button>
        </div>
      )}

      <table className="w-full border-collapse table-fixed text-left text-sm">
        <thead className="border-b border-neutral-800 text-neutral-400">
          <tr>
            <th className="w-10 px-2 py-2">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={toggleSelectAll}
                className="h-4 w-4 accent-green-500"
              />
            </th>

            <th className="w-12 px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="w-10 pr-2 py-2" />
            <th className="w-20 px-4 py-2 text-right">Duration</th>
          </tr>
        </thead>

        <tbody>
          {localTracks.map((track, index) => {
            const isInPlaylist = localTracks.some((t) => t.id === track.id);

            return (
              <TrackRow
                key={track.id}
                track={track}
                index={index}
                tracks={tracks}
                isInPlaylist={isInPlaylist}
                isSelected={selectedIds.has(track.id)}
                onSelect={() => toggleRow(track.id)}
                onAdd={addTrack}
                onRemove={removeTrack}
              />
            );
          })}
        </tbody>
      </table>
    </>
  );
}
