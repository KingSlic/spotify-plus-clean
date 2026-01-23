"use client";

import Link from "next/link";
import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";

export default function PlaylistCard({ playlist }: any) {
  const { play } = useAudioPlayer();

  return (
    <div className="group relative bg-neutral-900 hover:bg-neutral-800 transition rounded-lg p-4">
      <Link href={`/playlist/${playlist.id}`}>
        <img
          src={playlist.image_url || "/placeholder.png"}
          className="rounded mb-4 aspect-square object-cover"
        />

        <h3 className="font-semibold truncate">{playlist.name}</h3>
        <p className="text-sm text-neutral-400 line-clamp-2">
          {playlist.description}
        </p>
      </Link>

      {playlist.preview_url && (
        <button
          onClick={() => play(playlist.preview_url, playlist)}
          className="absolute bottom-20 right-6 opacity-0 group-hover:opacity-100 transition bg-green-500 rounded-full p-3 shadow-lg hover:scale-105"
        >
          ▶
        </button>
      )}
    </div>
  );
}
