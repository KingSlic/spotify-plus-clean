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

type RepeatMode = "off" | "one" | "all";

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
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onEnded = () => {
      if (!currentTrack) return;

      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }

      const q = queueRef.current;
      if (!q.length) {
        setIsPlaying(false);
        return;
      }

      const idx = q.findIndex((t) => t.id === currentTrack.id);
      const nextIdx = idx + 1;

      if (nextIdx < q.length) {
        internalPlay(q[nextIdx], {
          queue: q,
          playlistId: playlistIdRef.current,
        });
        return;
      }

      if (repeatMode === "all") {
        internalPlay(q[0], {
          queue: q,
          playlistId: playlistIdRef.current,
        });
        return;
      }

      setIsPlaying(false);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrack, repeatMode]);

  function internalPlay(track: Track, ctx?: PlayContext) {
    const audio = audioRef.current;
    if (!audio || !track.preview_url) return;

    if (ctx?.queue) queueRef.current = ctx.queue;
    if (ctx?.playlistId) playlistIdRef.current = ctx.playlistId;

    setCurrentTrack(track);

    if (audio.src !== track.preview_url) {
      audio.src = track.preview_url;
    }

    audio.play().catch(() => setIsPlaying(false));
  }

  function playTrack(track: Track, ctx?: PlayContext) {
    internalPlay(track, ctx);
  }

  function pause() {
    audioRef.current?.pause();
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
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return ctx;
}
