import type { Mood } from "./deriveMood";

export const moodColorClass: Record<Mood, string> = {
  chill: "bg-teal-400/60",
  melancholy: "bg-indigo-400/60",
  balanced: "bg-neutral-400/50",
  uplifting: "bg-amber-400/70",
  energetic: "bg-orange-400/70",
  intense: "bg-rose-400/70",
};

export const moodLabel: Record<Mood, string> = {
  chill: "Chill",
  melancholy: "Melancholy",
  balanced: "Balanced",
  uplifting: "Uplifting",
  energetic: "Energetic",
  intense: "Intense",
};
