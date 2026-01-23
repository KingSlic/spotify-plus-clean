"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";

export default function GlobalPlayer() {
  const { currentTrack, isPlaying, pause } = useAudioPlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 px-6 py-4 flex items-center justify-between">
      <div>
        <p className="text-white font-medium">{currentTrack.name}</p>
        <p className="text-sm text-neutral-400">
          {currentTrack.artists?.join(", ")}
        </p>
      </div>

      <button
        onClick={pause}
        className="text-white bg-green-500 px-4 py-2 rounded-full hover:bg-green-400"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
