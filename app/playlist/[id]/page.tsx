import { fetchPlaylistById, fetchTracksForPlaylist } from "@/lib/api/server";
import Image from "next/image";
import { computePlaylistAnalytics } from "./analytics";
import PlaylistActions from "./PlaylistActions";
import TrackTable from "./TrackTable";

export default async function PlaylistPage({
  params,
}: {
  params: { id: string };
}) {
  const playlist = await fetchPlaylistById(params.id);
  const tracks = await fetchTracksForPlaylist(params.id);

  if (!playlist) {
    return <div className="p-6 text-white">Playlist not found</div>;
  }

  const analytics = computePlaylistAnalytics(tracks);

  return (
    <div className="px-6 pt-6 text-white">
      {/* HEADER */}
      <div className="flex items-end gap-6 mb-8">
        <Image
          src={playlist.image_url || "/placeholder-playlist.png"}
          alt={playlist.name}
          width={200}
          height={200}
          className="rounded"
        />

        <div className="flex-1">
          <p className="uppercase text-sm text-gray-400">Playlist</p>
          <h1 className="text-5xl font-bold mb-2">{playlist.name}</h1>
          <p className="text-gray-400 mb-4">{playlist.description}</p>

          {/* ANALYTICS SUMMARY */}
          <div className="flex gap-6 text-sm text-gray-300">
            <span>⚡ Energy: {analytics.energy.toFixed(2)}</span>
            <span>💗 Valence: {analytics.valence.toFixed(2)}</span>
            <span>🎧 Mood: {analytics.mood}</span>
          </div>

          {/* ACTIONS (CLIENT) */}
          <PlaylistActions tracks={tracks} />
        </div>
      </div>

      {/* TRACK TABLE */}
      <TrackTable tracks={tracks} />
    </div>
  );
}
