"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Track = {
  id: string;
  title: string;
  preview_url: string | null;
  duration_ms?: number | null;
  album?: { image_url?: string | null } | null;
  artists?: { name: string }[];
};

type AudioPlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;

  onDurationResolved?: (trackId: string, seconds: number) => void;
  playTrack: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;

  /** 🔑 allow playback controller to hook into audio end */
  setOnEnded: (cb: (() => void) | null) => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export function AudioPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndedRef = useRef<(() => void) | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => {
      const d = audio.duration || 0;
      setDuration(d);

      if (currentTrack && onDurationResolved) {
        onDurationResolved(currentTrack.id, d);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      onEndedRef.current?.();
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function playTrack(track: Track) {
    const audio = audioRef.current;
    if (!audio || !track.preview_url) return;

    if (audio.src !== track.preview_url) {
      audio.src = track.preview_url;
    }

    setCurrentTrack(track);
    audio.play().catch(() => {
      setIsPlaying(false);
    });
  }

  function pause() {
    audioRef.current?.pause();
  }

  function resume() {
    audioRef.current?.play().catch(() => {});
  }

  function seek(time: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = Math.min(Math.max(time, 0), audio.duration || 0);
  }

  function setVolume(v: number) {
    const audio = audioRef.current;
    const clamped = Math.min(Math.max(v, 0), 1);
    if (!audio) return;
    audio.volume = clamped;
    setVolumeState(clamped);
  }

  function setOnEnded(cb: (() => void) | null) {
    onEndedRef.current = cb;
  }

  const value = useMemo(
    () => ({
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      playTrack,
      pause,
      resume,
      seek,
      setVolume,
      setOnEnded,
    }),
    [currentTrack, isPlaying, currentTime, duration, volume],
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
  }
  return ctx;
}
