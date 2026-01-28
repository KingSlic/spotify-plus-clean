import { Playlist } from "@/lib/types/playlist";
import Link from "next/link";

export default function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className="group rounded-lg bg-neutral-900 p-4 transition hover:bg-neutral-800"
    >
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-md bg-neutral-800">
        {playlist.image_url ? (
          <img
            src={playlist.image_url}
            alt={playlist.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-500">
            🎵
          </div>
        )}
      </div>

      <h3 className="truncate text-sm font-semibold text-white">
        {playlist.name}
      </h3>

      <p className="mt-1 truncate text-xs text-neutral-400">
        {playlist.type === "DailyMix"
          ? "Made for you"
          : playlist.type === "Radar"
            ? "New releases"
            : playlist.type === "Discover"
              ? "Discover new music"
              : "Playlist"}
      </p>
    </Link>
  );
}
