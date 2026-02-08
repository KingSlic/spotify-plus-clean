"use client";

import TrackRow from "@/app/components/TrackRow";
import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";
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
  const { currentTrack, skipToTrack, pause } = useAudioPlayer();

  const [localTracks, setLocalTracks] = useState<Track[]>(tracks);

  async function removeTrackFromPlaylist(trackId: string) {
    const snapshot = localTracks;

    const removedIndex = localTracks.findIndex((t) => t.id === trackId);
    const isRemovingCurrent = currentTrack?.id === trackId;

    // Optimistic remove
    const nextTracks = localTracks.filter((t) => t.id !== trackId);
    setLocalTracks(nextTracks);

    try {
      const res = await fetch(
        `${API_BASE}/playlists/${playlistId}/tracks/${trackId}`,
        { method: "DELETE" },
      );

      if (!res.ok) throw new Error("Delete failed");

      // 🎧 AUTO-SKIP LOGIC
      if (isRemovingCurrent) {
        const nextPlayable =
          nextTracks.slice(removedIndex).find((t) => t.preview_url) ||
          nextTracks
            .slice(0, removedIndex)
            .reverse()
            .find((t) => t.preview_url);

        if (nextPlayable) {
          skipToTrack(nextPlayable);
        } else {
          pause();
        }
      }
    } catch (err) {
      console.error("Delete failed, rolling back", err);
      setLocalTracks(snapshot);
    }
  }

  if (localTracks.length === 0) {
    return (
      <p className="mt-6 text-neutral-400">This playlist has no tracks.</p>
    );
  }

  return (
    <table className="w-full text-sm text-left border-collapse">
      <thead className="text-neutral-400 border-b border-neutral-800">
        <tr>
          <th className="w-12 px-4 py-2">#</th>
          <th className="px-4 py-2">Title</th>
          <th className="px-4 py-2 text-right">Duration</th>
          <th className="w-12 px-4 py-2" />
        </tr>
      </thead>

      <tbody>
        {localTracks.map((track, index) => (
          <TrackRow
            key={track.id}
            track={track}
            index={index}
            onRemove={removeTrackFromPlaylist}
          />
        ))}
      </tbody>
    </table>
  );
}
