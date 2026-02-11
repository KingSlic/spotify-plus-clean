"use client";

import TrackRow from "@/app/components/TrackRow";
import { usePlayback } from "@/app/contexts/PlaybackContext";
import { useState } from "react";

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

  const isInPlaylist = (id: string) => localTracks.some((t) => t.id === id);

  const allSelected = tracks.length > 0 && selectedIds.size === tracks.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < tracks.length;

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(tracks.map((t) => t.id)));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function removeTracks(ids: string[]) {
    const snapshot = localTracks;

    setLocalTracks((prev) => prev.filter((t) => !ids.includes(t.id)));
    ids.forEach(onTrackRemoved);
    setSelectedIds(new Set());

    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`${API_BASE}/playlists/${playlistId}/tracks/${id}`, {
            method: "DELETE",
          }),
        ),
      );
    } catch {
      setLocalTracks(snapshot);
    }
  }

  async function addTracks(ids: string[]) {
    const snapshot = localTracks;
    const toAdd = tracks.filter((t) => ids.includes(t.id));

    setLocalTracks((prev) => [...prev, ...toAdd]);
    setSelectedIds(new Set());

    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`${API_BASE}/playlists/${playlistId}/tracks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ track_id: id }),
          }),
        ),
      );
    } catch {
      setLocalTracks(snapshot);
    }
  }

  return (
    <>
      {/* BULK BAR */}
      {selectedIds.size > 0 && (
        <div className="mb-3 flex items-center gap-3 text-sm">
          <span className="text-neutral-400">{selectedIds.size} selected</span>
          <button
            onClick={() => addTracks([...selectedIds])}
            className="rounded bg-neutral-800 px-3 py-1 hover:bg-neutral-700"
          >
            Add selected
          </button>
          <button
            onClick={() => removeTracks([...selectedIds])}
            className="rounded bg-neutral-800 px-3 py-1 hover:bg-neutral-700"
          >
            Remove selected
          </button>
        </div>
      )}

      <table className="w-full border-collapse text-left text-sm table-fixed">
        <thead className="border-b border-neutral-800 text-neutral-400">
          <tr>
            <th className="w-12 px-4 py-2">
              <button
                onClick={toggleSelectAll}
                className="flex h-4 w-4 items-center justify-center rounded-full border border-neutral-600"
              >
                {allSelected || someSelected ? (
                  <span className="h-2 w-2 rounded-full bg-white" />
                ) : null}
              </button>
            </th>
            <th className="px-4 py-2">Title</th>
            <th className="w-10" />
            <th className="px-4 py-2 text-right">Duration</th>
          </tr>
        </thead>

        <tbody>
          {tracks.map((track, index) => (
            <TrackRow
              key={track.id}
              track={track}
              index={index}
              tracks={tracks}
              isInPlaylist={isInPlaylist(track.id)}
              selected={selectedIds.has(track.id)}
              onToggleSelect={() => toggleSelect(track.id)}
              onAdd={() => addTracks([track.id])}
              onRemove={() => removeTracks([track.id])}
            />
          ))}
        </tbody>
      </table>
    </>
  );
}
