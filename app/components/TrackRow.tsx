"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";

export default function TrackRow({ track, index }: any) {
  const { play } = useAudioPlayer();

  return (
    <div
      onClick={() => track.preview_url && play(track.preview_url, track)}
      className="grid grid-cols-[40px_1fr_100px] items-center gap-4 px-4 py-2 hover:bg-neutral-800 cursor-pointer rounded"
    >
      <span className="text-neutral-400 text-sm">{index + 1}</span>

      <div>
        <p className="text-white">{track.name}</p>
        <p className="text-sm text-neutral-400">
          {track.artists?.join(", ")}
        </p>
      </div>

      <span className="text-sm text-neutral-400 text-right">
        {Math.floor(track.duration_ms / 60000)}:
        {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, "0")}
      </span>
    </div>
  );
}
