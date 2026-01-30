import { Track } from "@/lib/types/track";

/**
 * Recommend replacement or adjacent tracks for a playlist.
 * This is advisory only.
 */
export function recommendTracks(
  playlistTracks: Track[],
  catalogTracks: Track[],
  limit = 5,
) {
  if (playlistTracks.length === 0) return [];

  const avgEnergy =
    playlistTracks.reduce((sum, t) => sum + (t.energy ?? 0), 0) /
    playlistTracks.length;

  const avgValence =
    playlistTracks.reduce((sum, t) => sum + (t.valence ?? 0), 0) /
    playlistTracks.length;

  const playlistTrackIds = new Set(playlistTracks.map((t) => t.id));

  const scored = catalogTracks
    .filter((t) => !playlistTrackIds.has(t.id))
    .map((track) => {
      const energyDelta = Math.abs((track.energy ?? 0) - avgEnergy);

      const valenceDelta = Math.abs((track.valence ?? 0) - avgValence);

      const score = energyDelta + valenceDelta;

      return {
        track,
        score,
        reasons: [
          energyDelta < 0.15 ? "Similar energy profile" : null,
          valenceDelta < 0.15 ? "Similar emotional tone" : null,
        ].filter(Boolean) as string[],
      };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);

  return scored;
}
