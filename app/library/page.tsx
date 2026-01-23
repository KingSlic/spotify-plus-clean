import PlaylistCard from "@/app/components/PlaylistCard";
import { getAllPlaylists } from "@/lib/api/server";

export default async function LibraryPage() {
  const playlists = await getAllPlaylists();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Your Library</h1>

      {playlists.length === 0 ? (
        <p className="text-neutral-400">No playlists yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {playlists.map((playlist: any) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}
