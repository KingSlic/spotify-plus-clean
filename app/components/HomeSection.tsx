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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </section>
  );
}
