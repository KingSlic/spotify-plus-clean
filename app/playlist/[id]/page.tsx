import { fetchPlaylistById, fetchTracksForPlaylist } from "@/lib/api/server";
import PlaylistClient from "./PlaylistClient";

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

  return <PlaylistClient playlist={playlist} tracks={tracks} />;
}
