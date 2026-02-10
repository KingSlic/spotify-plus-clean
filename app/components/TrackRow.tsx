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
  isSelected,
  onSelect,
  onAdd,
  onRemove,
}: {
  track: Track;
  index: number;
  tracks: Track[];
  isInPlaylist: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onAdd: (track: Track) => void;
  onRemove: (trackId: string) => void;
}) {
  const { currentTrack, isPlaying, duration } = useAudioPlayer();
  const { setQueue } = usePlayback();

  const isActive = currentTrack?.id === track.id;
  const hasPreview = Boolean(track.preview_url);

  function handlePlay() {
    if (!hasPreview) return;
    setQueue(tracks, index);
  }

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    isInPlaylist ? onRemove(track.id) : onAdd(track);
  }

  return (
    <tr
      className={[
        "group transition-colors",
        hasPreview ? "hover:bg-neutral-800" : "opacity-40",
        isActive ? "bg-neutral-800" : "",
        isSelected ? "bg-neutral-800/70" : "",
      ].join(" ")}
    >
      {/* CHECKBOX */}
      <td className="w-10 px-2 text-left">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 accent-green-500"
          aria-label="Select track"
        />
      </td>

      {/* INDEX / PLAY / EQ */}
      <td
        onClick={hasPreview ? handlePlay : undefined}
        className="w-12 px-4 text-sm text-neutral-400 cursor-pointer"
      >
        {!isActive && <span className="group-hover:hidden">{index + 1}</span>}

        {!isActive && hasPreview && (
          <span className="hidden group-hover:block text-white">▶</span>
        )}

        {isActive && isPlaying && (
          <span className="flex h-4 items-end gap-[2px]">
            <span className="eq-bar h-2" />
            <span className="eq-bar h-4" />
            <span className="eq-bar h-3" />
          </span>
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

      {/* ADD / REMOVE TOGGLE — LEFT OF DURATION */}
      <td className="w-10 pr-2 text-right align-middle">
        <button
          onClick={handleToggle}
          className="opacity-0 group-hover:opacity-100 transition"
          aria-label={isInPlaylist ? "Remove from playlist" : "Add to playlist"}
        >
          {isInPlaylist ? (
            <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-green-500 text-black text-[11px] leading-none">
              ✓
            </span>
          ) : (
            <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border border-neutral-600 text-neutral-500 text-[14px] leading-none">
              +
            </span>
          )}
        </button>
      </td>

      {/* DURATION */}
      <td
        onClick={hasPreview ? handlePlay : undefined}
        className="pl-2 pr-4 text-right text-sm text-neutral-400 cursor-pointer"
      >
        {formatDuration(
          currentTrack?.id === track.id && duration
            ? duration * 1000
            : track.duration_ms,
        )}
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
