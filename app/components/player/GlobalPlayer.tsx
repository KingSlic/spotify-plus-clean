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
import { useMemo, useState } from "react";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function GlobalPlayer() {
  /** Transport */
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
    playTrack,
  } = useAudioPlayer();

  /** Playback context (playlist-scoped) */
  const playback = usePlayback();

  const hasTrack = Boolean(currentTrack?.preview_url);
  const canNext = playback?.hasNext ?? false;
  const canPrev = playback?.hasPrev ?? false;

  /** Scrubbing */
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const [wasPlaying, setWasPlaying] = useState(false);

  const displayTime = isScrubbing ? scrubValue : currentTime;

  const artistLabel = useMemo(() => {
    if (!currentTrack?.artists?.length) return "";
    return currentTrack.artists.map((a) => a.name).join(", ");
  }, [currentTrack]);

  function togglePlay() {
    if (!hasTrack) return;
    if (isPlaying) pause();
    else resume();
  }

  function handleNext() {
    if (!playback?.hasNext) return;
    const idx = playback.next();
    if (idx != null) {
      const track = playback.tracks[idx];
      if (track?.preview_url) playTrack(track as any);
    }
  }

  function handlePrev() {
    if (!playback?.hasPrev) return;
    const idx = playback.prev();
    if (idx != null) {
      const track = playback.tracks[idx];
      if (track?.preview_url) playTrack(track as any);
    }
  }

  function startScrub() {
    if (!hasTrack) return;
    setIsScrubbing(true);
    setScrubValue(currentTime);
    setWasPlaying(isPlaying);
    if (isPlaying) pause();
  }

  function endScrub() {
    if (!hasTrack) return;
    setIsScrubbing(false);
    seek(scrubValue);
    if (wasPlaying) resume();
  }

  function toggleMute() {
    setVolume(volume === 0 ? 1 : 0);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="h-[90px] border-t border-neutral-800 bg-neutral-900/95 px-4">
        <div className="grid h-full grid-cols-[320px_1fr_320px] items-center gap-4">
          {/* LEFT — Track info */}
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

          {/* CENTER — Controls + seek */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrev}
                disabled={!canPrev}
                className="rounded-full p-2 text-neutral-300 hover:bg-neutral-800 disabled:opacity-40"
                aria-label="Previous"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                onClick={togglePlay}
                disabled={!hasTrack}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                  hasTrack
                    ? "bg-white text-black hover:scale-105"
                    : "cursor-not-allowed bg-neutral-700 text-neutral-400"
                }`}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="ml-[1px] h-5 w-5" />
                )}
              </button>

              <button
                onClick={handleNext}
                disabled={!canNext}
                className="rounded-full p-2 text-neutral-300 hover:bg-neutral-800 disabled:opacity-40"
                aria-label="Next"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            <div className="flex w-full max-w-[680px] items-center gap-2">
              <span className="w-10 text-right text-[11px] tabular-nums text-neutral-400">
                {formatTime(displayTime)}
              </span>

              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(displayTime, duration || 0)}
                onMouseDown={startScrub}
                onTouchStart={startScrub}
                onMouseUp={endScrub}
                onTouchEnd={endScrub}
                onChange={(e) => setScrubValue(Number(e.target.value))}
                disabled={!hasTrack}
                className="w-full accent-white"
              />

              <span className="w-10 text-[11px] tabular-nums text-neutral-400">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* RIGHT — Volume */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={toggleMute}
              className="rounded-full p-2 text-neutral-300 hover:bg-neutral-800"
              aria-label="Toggle mute"
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
