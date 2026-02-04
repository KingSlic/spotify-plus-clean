"use client";

import { useAudioPlayer } from "@/context/AudioPlayerContext";
import clsx from "clsx";

interface TrackRowProps {
  track: Track;
  index: number;
}

export default function TrackRow({ track, index }: TrackRowProps) {
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  const hasPreview = Boolean(track.preview_url);
  const isActive = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (!hasPreview) return;
    playTrack(track);
  };

  return (
    <tr
      onClick={handlePlay}
      className={clsx(
        "group transition-colors",
        hasPreview
          ? "cursor-pointer hover:bg-neutral-800"
          : "cursor-not-allowed opacity-50",
        isActive && "bg-neutral-800",
      )}
      title={!hasPreview ? "Preview unavailable for this track" : undefined}
    >
      {/* # */}
      <td className="w-12 px-4 text-sm text-neutral-400">
        {isActive && isPlaying ? "▶" : index + 1}
      </td>

      {/* Title */}
      <td className="px-4 py-2">
        <div className="flex flex-col">
          <span
            className={clsx(
              "font-medium",
              isActive ? "text-green-500" : "text-white",
            )}
          >
            {track.title}
          </span>
          <span className="text-sm text-neutral-400">{track.artist_name}</span>
        </div>
      </td>

      {/* Artist */}
      <td className="px-4 text-sm text-neutral-400">{track.artist_name}</td>

      {/* Duration */}
      <td className="px-4 text-sm text-neutral-400">{track.duration}</td>
    </tr>
  );
}
