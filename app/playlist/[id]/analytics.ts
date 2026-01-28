import { Track } from "@/lib/types/track";

export type PlaylistAnalytics = {
  energy: number;
  valence: number;
  tempo: number;
  mood: "High Energy" | "Balanced" | "Chill";
};

export function computePlaylistAnalytics(
  tracks: Track[],
): PlaylistAnalytics | null {
  if (!tracks.length) return null;

  const avg = (values: number[]) =>
    values.reduce((a, b) => a + b, 0) / values.length;

  const energy = avg(tracks.map((t) => t.energy ?? 0));
  const valence = avg(tracks.map((t) => t.valence ?? 0));
  const tempo = avg(tracks.map((t) => t.tempo ?? 0));

  const mood =
    energy > 0.7 ? "High Energy" : energy > 0.4 ? "Balanced" : "Chill";

  return {
    energy,
    valence,
    tempo,
    mood,
  };
}
