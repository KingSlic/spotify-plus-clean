// lib/telemetry/emitEvent.ts

export async function emitEvent(payload: {
  event: "play" | "pause" | "stop" | "skip" | "repeat";
  track_id: string;
  playlist_id?: string;
  position_ms?: number;
}) {
  await fetch("http://127.0.0.1:5000/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
