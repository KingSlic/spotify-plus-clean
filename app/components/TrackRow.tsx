"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";
import { usePlayback } from "../contexts/PlaybackContext";

type Track = {
  id: string;
  title: string;
  duration_ms: number | null;
  preview_url: string | null;
  artists?: { id: string; name: string }[];
};

export default function TrackRow({
  track,
  index,
  onRemove,
}: {
  track: Track;
  index: number;
  onRemove: (trackId: string) => void;
}) {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  const isActive = currentTrack?.id === track.id;
  const hasPreview = Boolean(track.preview_url);
  const { setContext } = usePlayback();

  function handlePlay() {
    if (!hasPreview) return;
    setContext(tracks, index);
    playTrack(track);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation(); // 🔑 prevent row play
    onRemove(track.id);
  }

  return (
    <tr
      onClick={handlePlay}
      className={[
        "group transition-colors",
        hasPreview
          ? "cursor-pointer hover:bg-neutral-800"
          : "cursor-not-allowed opacity-50",
        isActive ? "bg-neutral-800" : "",
      ].join(" ")}
    >
      {/* LEFT — index / play / EQ */}
      <td className="w-12 px-4 text-sm text-neutral-400">
        {/* Index */}
        {!isActive || !isPlaying ? (
          <span className="group-hover:hidden">{index + 1}</span>
        ) : null}

        {/* Hover play */}
        {!isActive && <span className="hidden group-hover:block">▶</span>}

        {/* Active EQ */}
        {isActive && isPlaying && (
          <span className="flex h-4 items-end gap-[2px]">
            <span className="eq-bar h-2" />
            <span className="eq-bar h-4" />
            <span className="eq-bar h-3" />
          </span>
        )}
      </td>

      {/* TITLE */}
      <td className="px-4 py-2">
        <div className="flex flex-col">
          <span
            className={
              isActive ? "font-medium text-green-500" : "font-medium text-white"
            }
          >
            {track.title}
          </span>
          <span className="text-sm text-neutral-400">
            {track.artists?.map((a) => a.name).join(", ")}
          </span>
        </div>
      </td>

      {/* DURATION */}
      <td className="px-4 text-right text-sm text-neutral-400">
        {formatDuration(track.duration_ms)}
      </td>

      {/* CHECK / REMOVE */}
      <td className="w-12 pr-4 text-right">
        <button
          onClick={handleRemove}
          className="opacity-0 group-hover:opacity-100 transition"
          aria-label="Remove from playlist"
        >
          <span className="text-green-500">✔</span>
        </button>
      </td>
    </tr>
  );
}

function formatDuration(ms?: number | null) {
  if (!ms) return "—";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
