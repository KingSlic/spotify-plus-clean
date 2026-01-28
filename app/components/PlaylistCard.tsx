"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";
import { Playlist } from "@/lib/types/playlist";
import Link from "next/link";

const API_BASE = "http://127.0.0.1:5000/api";

function gradientForSection(sectionId: string) {
  switch (sectionId) {
    case "made_for_you":
      return "from-emerald-900/80 via-black/40";
    case "discover":
      return "from-indigo-900/80 via-black/40";
    case "recent":
      return "from-purple-900/80 via-black/40";
    default:
      return "from-black/80 via-black/40";
  }
}

export default function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const { play } = useAudioPlayer();

  async function handlePlay(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch(`${API_BASE}/playlists/${playlist.id}/tracks`);
      if (!res.ok) return;

      const tracks = await res.json();
      const firstPlayable = tracks.find((t: any) => t.preview_url);

      if (firstPlayable) {
        play(firstPlayable.preview_url, firstPlayable);
      }
    } catch (err) {
      console.error("Failed to play playlist", err);
    }
  }

  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className="group relative rounded-lg bg-neutral-900 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-neutral-800 hover:shadow-xl hover:shadow-black/40"
    >
      {/* Artwork */}
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md bg-neutral-800">
        {playlist.image_url ? (
          <img
            src={playlist.image_url}
            alt={playlist.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-500">
            🎵
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className={[
            "pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent",
            gradientForSection(playlist.section_id),
            "transition-opacity duration-500 group-hover:opacity-90",
          ].join(" ")}
        />

        {/* Hover play button */}
        <button
          onClick={handlePlay}
          className="absolute bottom-3 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-black opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
          aria-label="Play"
        >
          ▶
        </button>
      </div>

      {/* Text */}
      <h3 className="truncate text-sm font-semibold text-white">
        {playlist.name}
      </h3>

      <p className="mt-1 truncate text-xs text-neutral-400">
        {playlist.description ?? "Playlist"}
      </p>
    </Link>
  );
}
