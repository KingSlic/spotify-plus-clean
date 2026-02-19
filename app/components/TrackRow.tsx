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

type Mode = "view" | "manage";

function formatTime(ms: number | null) {
  if (!ms) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function Equalizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      <div
        className={`w-[2px] h-4 bg-green-500 origin-bottom ${
          isPlaying ? "animate-equalizer" : "animate-equalizerSlow"
        }`}
        style={{ animationDelay: "0s" }}
      />
      <div
        className={`w-[2px] h-4 bg-green-500 origin-bottom ${
          isPlaying ? "animate-equalizer" : "animate-equalizerSlow"
        }`}
        style={{ animationDelay: "0.15s" }}
      />
      <div
        className={`w-[2px] h-4 bg-green-500 origin-bottom ${
          isPlaying ? "animate-equalizer" : "animate-equalizerSlow"
        }`}
        style={{ animationDelay: "0.3s" }}
      />
    </div>
  );
}

export default function TrackRow({
  track,
  index,
  tracks,
  mode,
  isSelected,
  toggleSelected,
  stagedMembership,
  toggleMembership,
}: {
  track: Track;
  index: number;
  tracks: Track[];
  mode: Mode;
  isSelected: boolean;
  toggleSelected: () => void;
  stagedMembership: boolean;
  toggleMembership: () => void;
}) {
  const { setQueue } = usePlayback();
  const { currentTrack, isPlaying } = useAudioPlayer();

  const isCurrent = currentTrack?.id === track.id;

  return (
    <tr className="group hover:bg-neutral-800 transition">
      {/* LEFT COLUMN */}
      <td className="px-4 py-3 w-12 text-neutral-400">
        {mode === "manage" ? (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={toggleSelected}
            className="h-4 w-4 accent-green-500"
          />
        ) : isCurrent ? (
          <Equalizer isPlaying={isPlaying} />
        ) : (
          <span>{index + 1}</span>
        )}
      </td>

      {/* TITLE */}
      <td
        className="px-4 py-3 cursor-pointer"
        onClick={() => {
          if (mode === "view" && track.preview_url) {
            setQueue(tracks, index);
          }
        }}
      >
        <div
          className={`font-medium ${
            isCurrent ? "text-green-500" : "text-white"
          }`}
        >
          {track.title}
        </div>
        <div className="text-sm text-neutral-400">
          {track.artists?.map((a) => a.name).join(", ")}
        </div>
      </td>

      {/* TOGGLE BUBBLE */}
      <td className="px-4 py-3 w-14 text-right">
        {mode === "manage" && (
          <button
            onClick={toggleMembership}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition
              ${
                stagedMembership
                  ? "bg-green-500 border-green-500 text-black"
                  : "border-neutral-500 text-neutral-400 hover:border-white hover:text-white"
              }
            `}
          >
            {stagedMembership ? "✓" : "+"}
          </button>
        )}
      </td>

      {/* DURATION */}
      <td className="px-4 py-3 w-20 text-right text-neutral-400">
        {formatTime(track.duration_ms)}
      </td>
    </tr>
  );
}
