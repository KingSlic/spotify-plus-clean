"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";

export default function GlobalPlayer() {
  const { currentTrack, isPlaying, pause, playTrack } = useAudioPlayer();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-neutral-900 border-t border-neutral-800 px-6 flex items-center justify-between z-50">
      {/* LEFT — Track info */}
      <div className="flex items-center gap-4 min-w-0">
        {currentTrack ? (
          <>
            <div className="min-w-0">
              <p className="text-sm text-white truncate">
                {currentTrack.title}
              </p>
              <p className="text-xs text-neutral-400 truncate">
                {currentTrack.artists?.map((a) => a.name).join(", ")}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-500">Nothing playing</p>
        )}
      </div>

      {/* CENTER — Controls */}
      <div className="flex items-center gap-4">
        <button
          disabled={!currentTrack}
          onClick={() =>
            currentTrack && (isPlaying ? pause() : playTrack(currentTrack))
          }
          className={`px-4 py-2 rounded-full font-semibold ${
            currentTrack
              ? "bg-white text-black"
              : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
          }`}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      {/* RIGHT — spacer (future volume / repeat) */}
      <div className="w-32" />
    </div>
  );
}
