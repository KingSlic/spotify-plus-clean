import { fetchPlaylistById, fetchTracksForPlaylist } from "@/lib/api/client";
import { computePlaylistAnalytics } from "./analytics";
import TrackTable from "./TrackTable";

export default async function PlaylistPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch data from backend
  const playlist = await fetchPlaylistById(params.id);
  const tracks = await fetchTracksForPlaylist(params.id);

  // Handle not found (real 404 only)
  if (!playlist) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold">Playlist not found</h1>
        <p className="mt-2 text-neutral-400">
          This playlist does not exist or may have been removed.
        </p>
      </div>
    );
  }

  // Read-only analytics (client-safe, deterministic)
  const analytics = computePlaylistAnalytics(tracks);

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{playlist.name}</h1>

        {playlist.description && (
          <p className="mt-2 text-neutral-400">{playlist.description}</p>
        )}

        {/* Analytics */}
        {analytics && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-400">
            <span>⚡ Energy: {analytics.energy.toFixed(2)}</span>
            <span>💓 Valence: {analytics.valence.toFixed(2)}</span>
            <span>🎵 Tempo: {Math.round(analytics.tempo)} BPM</span>
            <span>🎧 Mood: {analytics.mood}</span>
          </div>
        )}
      </div>

      {/* Tracks */}
      <TrackTable tracks={tracks} />
    </div>
  );
}
