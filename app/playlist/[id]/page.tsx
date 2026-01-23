import {
  fetchPlaylistById,
  fetchTracksForPlaylist,
} from "@/lib/api/server";

export default async function PlaylistPage({
  params,
}: {
  params: { id: string };
}) {
  const playlist = await fetchPlaylistById(params.id);
  const tracks = await fetchTracksForPlaylist(params.id);

  if (!playlist) {
    return <div className="p-6 text-white">Playlist not found.</div>;
  }

  return (
    <div className="p-6 text-white">
      {/* Playlist title */}
      <h1 className="text-3xl font-bold">
        {playlist.name}
      </h1>

      {/* 🔹 POLISH LINE (10-minute win) */}
      <p className="text-xs uppercase tracking-wide text-neutral-500 mt-1 mb-2">
        Backend-defined playlist · Real MySQL data
      </p>

      {/* Playlist description */}
      <p className="text-neutral-400 mb-6">
        {playlist.description}
      </p>

      {/* Track table */}
      <table className="w-full text-sm">
        <thead className="text-neutral-400 border-b border-neutral-800">
          <tr>
            <th className="text-left py-2">#</th>
            <th className="text-left py-2">Track</th>
            <th className="text-left py-2">Energy</th>
            <th className="text-left py-2">Valence</th>
            <th className="text-left py-2">Tempo</th>
            <th className="text-left py-2">Why it’s here</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((t: any, i: number) => (
            <tr
              key={t.id}
              className="border-b border-neutral-900 hover:bg-neutral-900"
            >
              <td className="py-2">{i + 1}</td>
              <td className="py-2">{t.name}</td>
              <td className="py-2">{t.energy ?? "-"}</td>
              <td className="py-2">{t.valence ?? "-"}</td>
              <td className="py-2">{t.tempo ?? "-"}</td>
              <td className="py-2 text-xs text-neutral-400">
                Position {t.position} · Plays {t.playCount ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
