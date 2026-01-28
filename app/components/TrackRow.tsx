"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";
import { Track } from "@/lib/types/track";

type TrackRowProps = {
  track: Track;
  index: number;
};

export default function TrackRow({ track, index }: TrackRowProps) {
  const { play } = useAudioPlayer();

  return (
    <div
      onClick={() => track.preview_url && play(track.preview_url, track)}
      className="grid grid-cols-[40px_1fr_80px] items-center gap-4 px-4 py-2 hover:bg-neutral-800 cursor-pointer rounded"
    >
      {/* Index */}
      <span className="text-neutral-400 text-sm">{index + 1}</span>

      {/* Title + Artist */}
      <div className="min-w-0">
        <p className="text-white truncate">{track.title}</p>
        <p className="text-sm text-neutral-400 truncate">
          {track.artists.map((a) => a.name).join(", ")}
        </p>
      </div>

      {/* Duration */}
      <span className="text-sm text-neutral-400 text-right">
        {formatDuration(track.duration_ms)}
      </span>
    </div>
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
