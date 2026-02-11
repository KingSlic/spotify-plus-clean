"use client";

import { useAudioPlayer } from "@/app/contexts/AudioPlayerContext";
import { usePlayback } from "@/app/contexts/PlaybackContext";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useMemo } from "react";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function GlobalPlayer() {
  const audio = useAudioPlayer();
  const playback = usePlayback();

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    pause,
    resume,
    seek,
    setVolume,
  } = audio;

  const hasTrack = Boolean(currentTrack?.preview_url);

  /** 🔑 AUTO-ADVANCE (FINAL, SINGLE WIRE) */
  useEffect(() => {
    audio.setOnEnded(() => {
      if (playback.hasNext) {
        playback.next();
      }
    });

    return () => audio.setOnEnded(null);
  }, [audio, playback]);

  const artistLabel = useMemo(() => {
    if (!currentTrack?.artists?.length) return "";
    return currentTrack.artists.map((a) => a.name).join(", ");
  }, [currentTrack]);

  function togglePlay() {
    if (!hasTrack) return;
    isPlaying ? pause() : resume();
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="h-[90px] border-t border-neutral-800 bg-neutral-900/95 px-4">
        <div className="grid h-full grid-cols-[320px_1fr_320px] items-center gap-4">
          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-neutral-800">
              {currentTrack?.album?.image_url && (
                <img
                  src={currentTrack.album.image_url}
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm text-white">
                {currentTrack?.title ?? "Nothing playing"}
              </div>
              <div className="truncate text-xs text-neutral-400">
                {artistLabel}
              </div>
            </div>
          </div>

          {/* CENTER */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <button
                onClick={playback.prev}
                disabled={!playback.hasPrev}
                className="rounded-full p-2 text-neutral-300 hover:bg-neutral-800 disabled:opacity-40"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                onClick={togglePlay}
                disabled={!hasTrack}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="ml-[1px] h-5 w-5" />
                )}
              </button>

              <button
                onClick={playback.next}
                disabled={!playback.hasNext}
                className="rounded-full p-2 text-neutral-300 hover:bg-neutral-800 disabled:opacity-40"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            <div className="flex w-full max-w-[680px] items-center gap-2">
              <span className="w-10 text-right text-[11px] tabular-nums text-neutral-400">
                {formatTime(currentTime)}
              </span>

              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(e) => seek(Number(e.target.value))}
                disabled={!hasTrack}
                className="w-full accent-white"
              />

              <span className="w-10 text-[11px] tabular-nums text-neutral-400">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
              className="rounded-full p-2 text-neutral-300 hover:bg-neutral-800"
            >
              {volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-[120px] accent-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
