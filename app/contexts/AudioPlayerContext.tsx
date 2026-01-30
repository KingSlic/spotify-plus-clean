// app/contexts/AudioPlayerContext.tsx
"use client";

import React, {
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
  album?: { id: string; title: string; image_url?: string | null } | null;
  artists?: { id: string; name: string }[];
  [key: string]: any;
};

type PlayContext = {
  playlistId?: string;
  queue?: Track[];
};

type AudioPlayerContextType = {
  playTrack: (track: Track, ctx?: PlayContext) => void;
  pause: () => void;
  currentTrack: Track | null;
  isPlaying: boolean;
};

const AudioPlayerContext = createContext<AudioPlayerContextType>({
  playTrack: () => {},
  pause: () => {},
  currentTrack: null,
  isPlaying: false,
});

const FALLBACK_PREVIEW_URL = "/audio/demo.mp3";

export function AudioPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const queueRef = useRef<Track[]>([]);
  const playlistIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  function internalPlay(track: Track, ctx?: PlayContext) {
    const audio = audioRef.current;
    if (!audio) return;

    // ✅ Always set current track so GlobalPlayer updates
    setCurrentTrack(track);

    // ✅ Use preview_url if present, otherwise fallback demo MP3
    const src = track.preview_url || FALLBACK_PREVIEW_URL;

    if (ctx?.queue) queueRef.current = ctx.queue;
    if (ctx?.playlistId) playlistIdRef.current = ctx.playlistId;

    if (audio.src !== src) audio.src = src;

    audio.play().catch(() => {
      setIsPlaying(false);
    });
  }

  function playTrack(track: Track, ctx?: PlayContext) {
    internalPlay(track, ctx);
  }

  function pause() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
  }

  const value = useMemo<AudioPlayerContextType>(
    () => ({
      playTrack,
      pause,
      currentTrack,
      isPlaying,
    }),
    [currentTrack, isPlaying],
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
