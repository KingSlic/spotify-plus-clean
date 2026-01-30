"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";
import { Track } from "@/lib/types/track";

export default function TrackTable({ tracks }: { tracks: Track[] }) {
  const { playTrack, currentTrack } = useAudioPlayer();

  function handlePlay(track: Track) {
    playTrack(track, { queue: tracks });
  }

  return (
    <table className="w-full text-sm">
      <thead className="border-b border-white/10 text-gray-400">
        <tr>
          <th className="w-12 text-right pr-4">#</th>
          <th className="text-left">Title</th>
          <th className="text-left">Artist</th>
          <th className="text-right pr-2">Duration</th>
        </tr>
      </thead>

      <tbody>
        {tracks.map((track, i) => {
          const isCurrent = currentTrack?.id === track.id;

          return (
            <tr
              key={track.id}
              className={`group h-12 cursor-pointer hover:bg-white/10 ${
                isCurrent ? "bg-white/5" : ""
              }`}
              onDoubleClick={() => handlePlay(track)}
            >
              {/* index / play */}
              <td className="text-right pr-4 text-gray-400">
                <span className="group-hover:hidden">{i + 1}</span>
                <button
                  onClick={() => handlePlay(track)}
                  className="hidden group-hover:inline text-white"
                >
                  ▶
                </button>
              </td>

              {/* title */}
              <td className={isCurrent ? "text-green-500 font-semibold" : ""}>
                {track.title}
              </td>

              {/* artist */}
              <td className="text-gray-300">
                {track.artists?.map((a) => a.name).join(", ")}
              </td>

              {/* duration */}
              <td className="text-right pr-2 text-gray-400">
                {track.duration_ms
                  ? Math.floor(track.duration_ms / 60000) +
                    ":" +
                    String(
                      Math.floor((track.duration_ms % 60000) / 1000),
                    ).padStart(2, "0")
                  : "--:--"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
