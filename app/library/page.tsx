import PlaylistCard from "@/app/components/PlaylistCard";
import { fetchPlaylists } from "@/lib/api/server";

export default async function LibraryPage() {
  const playlists = await fetchPlaylists();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Your Library</h1>

      {playlists.length === 0 ? (
        <p className="text-neutral-400">
          You haven’t created any playlists yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}
