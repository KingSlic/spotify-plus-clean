"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";
import { Track } from "@/types/track";

export default function TrackTable({ tracks }: { tracks: Track[] }) {
  const { play, currentTrack } = useAudioPlayer();

  if (!tracks.length) {
    return (
      <div className="text-neutral-400">This playlist has no tracks yet.</div>
    );
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-neutral-700">
        <tr className="text-neutral-400">
          <th className="py-2 pr-4">#</th>
          <th className="py-2">Title</th>
          <th className="py-2">Artist</th>
          <th className="py-2">Album</th>
          <th className="py-2 text-right">Duration</th>
        </tr>
      </thead>

      <tbody>
        {tracks.map((track, i) => {
          const isActive = currentTrack?.id === track.id;

          return (
            <tr
              key={track.id}
              onClick={() =>
                track.preview_url && play(track.preview_url, track)
              }
              className={[
                "group cursor-pointer border-b border-neutral-800",
                isActive ? "bg-neutral-800/70" : "hover:bg-neutral-800/50",
              ].join(" ")}
            >
              {/* Index / Play indicator */}
              <td className="relative py-2 pr-4 text-neutral-500 w-10">
                {isActive ? (
                  <span className="text-green-500">▶</span>
                ) : (
                  <>
                    <span className="group-hover:hidden">{i + 1}</span>
                    <span className="hidden group-hover:inline text-white">
                      ▶
                    </span>
                  </>
                )}
              </td>

              <td
                className={[
                  "py-2 font-medium",
                  isActive ? "text-green-500" : "text-white",
                ].join(" ")}
              >
                {track.title}
              </td>

              <td className="py-2 text-neutral-300">
                {track.artists.map((a) => a.name).join(", ")}
              </td>

              <td className="py-2 text-neutral-400">
                {track.album?.title ?? "—"}
              </td>

              <td className="py-2 text-right text-neutral-400">
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
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}
