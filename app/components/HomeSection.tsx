import { Playlist } from "@/lib/types/playlist";
import PlaylistCard from "./PlaylistCard";

export default function HomeSection({
  title,
  playlists,
}: {
  title: string;
  playlists: Playlist[];
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>

      {/* Horizontal scroll rail */}
      <div className="relative">
        <div className="-mx-2 px-2 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-6 pr-2 scrollbar-hide">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="w-[180px] flex-shrink-0">
                <PlaylistCard playlist={playlist} />
              </div>
            ))}
          </div>
        </div>

        {/* Right-side fade hint */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-black/80 to-transparent" />
      </div>
    </section>
  );
}
