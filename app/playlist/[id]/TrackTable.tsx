"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";
import { Track } from "@/lib/types/track";

export default function TrackTable({ tracks }: { tracks: Track[] }) {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  return (
    <table className="w-full text-sm text-left">
      <thead className="text-neutral-400 border-b border-neutral-800">
        <tr>
          <th className="px-4 py-2 w-10">#</th>
          <th className="px-4 py-2">Title</th>
          <th className="px-4 py-2">Artist</th>
          <th className="px-4 py-2 text-right">Duration</th>
        </tr>
      </thead>

      <tbody>
        {tracks.map((track, i) => {
          const isActive = currentTrack?.id === track.id;

          return (
            <tr
              key={track.id}
              onClick={() => {
                if (!track.preview_url) return;
                playTrack(track, { queue: tracks });
              }}
              className={`cursor-pointer ${
                isActive ? "bg-neutral-800" : "hover:bg-neutral-800"
              }`}
            >
              <td className="px-4 py-2 text-neutral-400">
                {isActive && isPlaying ? "▶" : i + 1}
              </td>

              <td className="px-4 py-2 text-white">{track.title}</td>

              <td className="px-4 py-2 text-neutral-400">
                {track.artists.map((a) => a.name).join(", ")}
              </td>

              <td className="px-4 py-2 text-right text-neutral-400">
                {formatDuration(track.duration_ms)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function formatDuration(ms?: number) {
  if (!ms) return "—";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
