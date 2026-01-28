import { fetchPlaylistById, fetchTracksForPlaylist } from "@/lib/api/server";
import TrackTable from "./TrackTable";

export default async function PlaylistPage({
  params,
}: {
  params: { id: string };
}) {
  const playlist = await fetchPlaylistById(params.id);
  const tracks = await fetchTracksForPlaylist(params.id);

  if (!playlist) {
    return (
      <div className="p-8 text-white">
        <h1 className="text-2xl font-bold">Playlist not found</h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end gap-6">
        <div className="h-48 w-48 flex-shrink-0 rounded bg-neutral-800 overflow-hidden">
          {playlist.image_url ? (
            <img
              src={playlist.image_url}
              alt={playlist.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl text-neutral-600">
              🎵
            </div>
          )}
        </div>

        <div>
          <p className="text-sm uppercase tracking-wide text-neutral-400">
            Playlist
          </p>
          <h1 className="mt-2 text-5xl font-bold text-white">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="mt-4 text-neutral-400">{playlist.description}</p>
          )}
        </div>
      </div>

      {/* Tracks */}
      <TrackTable tracks={tracks} />
    </div>
  );
}
