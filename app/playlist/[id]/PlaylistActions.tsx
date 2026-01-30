"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";
import { Track } from "@/lib/types/track";

export default function PlaylistActions({ tracks }: { tracks: Track[] }) {
  const { playTrack } = useAudioPlayer();

  function handlePlayAll() {
    if (!tracks.length) return;
    playTrack(tracks[0], { queue: tracks });
  }

  return (
    <div className="flex items-center gap-4 mt-4">
      <button
        onClick={handlePlayAll}
        className="bg-green-500 text-black px-6 py-2 rounded-full font-semibold hover:scale-105 transition"
      >
        ▶ Play
      </button>

      <button className="border border-gray-600 px-4 py-2 rounded">Add</button>

      <button className="border border-gray-600 px-4 py-2 rounded">
        Remove
      </button>

      <button className="text-sm text-gray-400 ml-4">Select All</button>
    </div>
  );
}
