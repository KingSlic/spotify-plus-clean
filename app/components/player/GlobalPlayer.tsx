"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";

export default function GlobalPlayer() {
  const { currentTrack, isPlaying, pause, playTrack } = useAudioPlayer();

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-800 h-24 flex items-center px-6 text-neutral-400">
        Nothing playing
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-800 h-24 px-6 flex items-center justify-between">
      {/* LEFT — track info */}
      <div className="flex items-center gap-4 min-w-0 w-[30%]">
        <div className="min-w-0">
          <p className="text-white text-sm truncate">{currentTrack.title}</p>
          <p className="text-neutral-400 text-xs truncate">
            {currentTrack.artists?.map((a) => a.name).join(", ")}
          </p>
        </div>
      </div>

      {/* CENTER — play / pause */}
      <div className="flex items-center justify-center w-[40%]">
        <button
          onClick={() => {
            if (isPlaying) pause();
            else playTrack(currentTrack);
          }}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition"
        >
          {isPlaying ? "❚❚" : "▶"}
        </button>
      </div>

      {/* RIGHT — placeholder (volume later) */}
      <div className="w-[30%]" />
    </div>
  );
}
