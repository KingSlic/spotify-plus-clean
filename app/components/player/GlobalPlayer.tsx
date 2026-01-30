"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";

export default function GlobalPlayer() {
  const { currentTrack, isPlaying, pause, resume } = useAudioPlayer();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="h-full bg-neutral-900/95 border-t border-neutral-800">
        <div className="h-full max-w-screen-xl mx-auto px-6 flex items-center justify-between">
          {/* Left */}
          <div className="text-sm text-neutral-400 truncate max-w-[40%]">
            {currentTrack ? currentTrack.title : "Nothing playing"}
          </div>

          {/* Center */}
          <button
            className="px-6 py-2 rounded-full bg-white text-black font-semibold"
            onClick={() => {
              if (!currentTrack) return;
              if (isPlaying) pause();
              else resume();
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          {/* Right spacer */}
          <div className="w-24" />
        </div>
      </div>
    </div>
  );
}
