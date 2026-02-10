"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";
import { usePlayback } from "../../contexts/PlaybackContext";
import { useMemo } from "react";

type Track = {
  id: string;
  preview_url: string | null;
};

export default function PlaylistActions({ tracks }: { tracks: Track[] }) {
  const { playTrack } = useAudioPlayer();
  const { setQueue } = usePlayback();

  const firstPlayable = useMemo(
    () => tracks.find((t) => Boolean(t.preview_url)) ?? null,
    [tracks],
  );

  function handlePlay() {
    if (!firstPlayable) return;

    const startIndex = tracks.findIndex((t) => t.id === firstPlayable.id);

    setQueue(tracks, startIndex);
  }

  return (
    <div className="mt-5 flex items-center gap-3">
      <button
        onClick={handlePlay}
        disabled={!firstPlayable}
        className="flex items-center rounded-full bg-green-500 px-8 py-3 font-semibold text-white hover:bg-green-400 hover:scale-[1.02] transition disabled:opacity-40"
      >
        <span className="mr-2 flex h-6 w-6 items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>

        <span className="leading-none">Play</span>
      </button>
    </div>
  );
}
