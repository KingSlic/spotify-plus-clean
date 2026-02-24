import PlaylistCard from "@/app/components/PlaylistCard";
import { fetchPlaylists } from "@/lib/api/server";
import SpotifySection from "./SpotifySection";

export default async function LibraryPage() {
  const playlists = await fetchPlaylists();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Your Library</h1>

      {/* 🎵 Local Cadence Playlists (Primary) */}
      {playlists.length === 0 ? (
        <p className="text-neutral-400 mb-12">
          You haven’t created any playlists yet.
        </p>
      ) : (
        <div className="mb-16">
          <h2 className="text-white text-xl font-semibold mb-4">
            Your Cadence Playlists
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </div>
      )}

      {/* 🔐 Spotify Integration Section (Secondary) */}
      <div className="border-t border-neutral-800 pt-10">
        <SpotifySection />
      </div>
    </div>
  );
}
