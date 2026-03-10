"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";
import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useState } from "react";

function formatTime(seconds: number) {
  if (!seconds) return "0:00";

  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);

  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GlobalPlayer() {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    pause,
    currentTime,
    duration,
    seek,
    setVolume,
  } = useAudioPlayer();

  const [volume, setLocalVolume] = useState(1);

  if (!currentTrack) return null;

  function handlePlayPause() {
    if (isPlaying) {
      pause();
    } else {
      playTrack(currentTrack);
    }
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);

    setLocalVolume(v);
    setVolume(v);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const time = Number(e.target.value);
    seek(time);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 px-4 py-3 flex items-center justify-between">
      {/* TRACK INFO */}

      <div className="flex items-center gap-3 w-1/3">
        {currentTrack.image && (
          <img src={currentTrack.image} className="w-12 h-12 rounded" />
        )}

        <div className="min-w-0">
          <div className="text-white text-sm font-medium truncate">
            {currentTrack.name}
          </div>

          <div className="text-neutral-400 text-xs truncate">
            {currentTrack.artists}
          </div>
        </div>
      </div>

      {/* PLAYER CONTROLS */}

      <div className="flex flex-col items-center w-1/3">
        <div className="flex items-center gap-4 mb-1">
          <button className="text-neutral-400 hover:text-white">
            <SkipBack size={20} />
          </button>

          <button
            onClick={handlePlayPause}
            className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button className="text-neutral-400 hover:text-white">
            <SkipForward size={20} />
          </button>
        </div>

        {/* SEEK BAR */}

        <div className="flex items-center gap-2 w-full max-w-md">
          <div className="text-xs text-neutral-400 w-10 text-right">
            {formatTime(currentTime)}
          </div>

          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1"
          />

          <div className="text-xs text-neutral-400 w-10">
            {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* VOLUME */}

      <div className="flex items-center gap-2 w-1/3 justify-end">
        <Volume2 size={18} className="text-neutral-400" />

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolume}
          className="w-24"
        />
      </div>
    </div>
  );
}
