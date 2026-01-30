export type Mood =
  | "chill"
  | "melancholy"
  | "balanced"
  | "uplifting"
  | "energetic"
  | "intense";

export type TrackForMood = {
  energy?: number | null;
  valence?: number | null;
  tempo?: number | null;
};

function clamp01(x: number) {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

/**
 * deriveMood(track)
 * - Uses energy + valence as primary drivers.
 * - Tempo is not used to change the mood class in v1 (only later as a UI modifier).
 * - Defaults to 0.5 when data is missing to avoid spiky misclassification.
 */

export function deriveMood(track: TrackForMood): Mood {
  const e = clamp01(track.energy ?? 0.5);
  const v = clamp01(track.valence ?? 0.5);

  // Low energy band
  if (e < 0.35) {
    return v < 0.4 ? "melancholy" : "chill";
  }

  // Mid energy band
  if (e <= 0.65) {
    return v < 0.45 ? "balanced" : "uplifting";
  }

  // High energy band
  return v < 0.45 ? "intense" : "energetic";
}

/**
 * Optional: convert raw metrics into human-readable labels (for Analyze mode).
 * Keeps honesty: these are coarse bands, not precise claims.
 */

export function energyLabel(energy?: number | null) {
  const e = energy ?? 0.5;
  if (e < 0.35) return "Low";
  if (e <= 0.65) return "Medium";
  return "High";
}

export function valenceLabel(valence?: number | null) {
  const v = valence ?? 0.5;
  if (v < 0.4) return "Negative";
  if (v <= 0.6) return "Neutral";
  return "Positive";
}

export function tempoLabel(tempo?: number | null) {
  const t = tempo ?? 120;
  if (t < 90) return "Slow";
  if (t <= 125) return "Mid";
  return "Fast";
}
