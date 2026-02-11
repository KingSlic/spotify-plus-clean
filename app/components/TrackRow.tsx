"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";
import { usePlayback } from "@/app/contexts/PlaybackContext";

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
  tracks,
  isInPlaylist,
  selected,
  onToggleSelect,
  onAdd,
  onRemove,
}: {
  track: Track;
  index: number;
  tracks: Track[];
  isInPlaylist: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const { currentTrack, isPlaying } = useAudioPlayer();
  const { setQueue } = usePlayback();

  const isActive = currentTrack?.id === track.id;
  const hasPreview = Boolean(track.preview_url);

  function handlePlay() {
    if (!hasPreview) return;
    setQueue(tracks, index);
  }

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    isInPlaylist ? onRemove() : onAdd();
  }

  function handleSelect(e: React.MouseEvent) {
    e.stopPropagation();
    onToggleSelect();
  }

  return (
    <tr
      className={[
        "group transition-colors",
        hasPreview ? "hover:bg-neutral-800" : "opacity-40",
        isActive ? "bg-neutral-800" : "",
      ].join(" ")}
    >
      {/* INDEX / PLAY / EQ / SELECT */}
      <td
        onClick={hasPreview ? handlePlay : undefined}
        className="relative w-12 px-4 cursor-pointer text-sm text-neutral-400"
      >
        {/* Selection dot */}
        {selected ? (
          <button
            onClick={handleSelect}
            className="flex h-4 w-4 items-center justify-center rounded-full bg-white"
          >
            <span className="h-2 w-2 rounded-full bg-black" />
          </button>
        ) : isActive && isPlaying ? (
          <span className="flex h-4 items-end gap-[2px]">
            <span className="eq-bar h-2" />
            <span className="eq-bar h-4" />
            <span className="eq-bar h-3" />
          </span>
        ) : (
          <>
            <span className="group-hover:hidden">{index + 1}</span>
            {hasPreview && (
              <span className="hidden group-hover:block text-white">▶</span>
            )}
          </>
        )}
      </td>

      {/* TITLE */}
      <td
        onClick={hasPreview ? handlePlay : undefined}
        className="px-4 py-2 cursor-pointer"
      >
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

      {/* ADD / REMOVE */}
      <td className="w-10 text-center">
        <button
          onClick={handleToggle}
          className="opacity-0 group-hover:opacity-100 transition"
        >
          {isInPlaylist ? (
            <span className="inline-flex h-[16px] w-[16px] items-center justify-center rounded-full bg-green-500 text-black text-[11px]">
              ✓
            </span>
          ) : (
            <span className="inline-flex h-[16px] w-[16px] items-center justify-center rounded-full border border-neutral-600 text-neutral-500 text-[14px]">
              +
            </span>
          )}
        </button>
      </td>

      {/* DURATION */}
      <td
        onClick={hasPreview ? handlePlay : undefined}
        className="px-4 text-right text-sm text-neutral-400 cursor-pointer"
      >
        {formatDuration(track.duration_ms)}
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
