"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";

type Track = {
  id: string;
  preview_url: string | null;
};

type PlaybackContextType = {
  tracks: Track[];
  index: number;
  hasNext: boolean;
  hasPrev: boolean;

  setQueue: (tracks: Track[], index: number) => void;
  next: () => void;
  prev: () => void;
  onTrackRemoved: (trackId: string) => void;
};

const PlaybackContext = createContext<PlaybackContextType | null>(null);

function isPlayable(t: Track) {
  return Boolean(t.preview_url);
}

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const audio = useAudioPlayer();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [index, setIndex] = useState(0);

  function playAt(i: number) {
    const t = tracks[i];
    if (t && isPlayable(t)) {
      audio.playTrack(t as any);
    }
  }

  function setQueue(nextTracks: Track[], startIndex: number) {
    setTracks(nextTracks);

    let i = startIndex;
    if (!isPlayable(nextTracks[i])) {
      i = nextTracks.findIndex(isPlayable);
    }
    if (i < 0) return;

    setIndex(i);
    queueMicrotask(() => playAt(i));
  }

  function next() {
    for (let i = index + 1; i < tracks.length; i++) {
      if (isPlayable(tracks[i])) {
        setIndex(i);
        playAt(i);
        return;
      }
    }
  }

  function prev() {
    for (let i = index - 1; i >= 0; i--) {
      if (isPlayable(tracks[i])) {
        setIndex(i);
        playAt(i);
        return;
      }
    }
  }

  function onTrackRemoved(trackId: string) {
    const idx = tracks.findIndex((t) => t.id === trackId);
    if (idx === -1) return;

    const nextTracks = tracks.filter((t) => t.id !== trackId);
    setTracks(nextTracks);

    if (idx < index) {
      setIndex((i) => i - 1);
      return;
    }

    if (idx === index) {
      for (let i = index; i < nextTracks.length; i++) {
        if (isPlayable(nextTracks[i])) {
          setIndex(i);
          playAt(i);
          return;
        }
      }
      audio.pause();
    }
  }

  /** 🔥 AUTO-ADVANCE ON TRACK END */
  useEffect(() => {
    audio.setOnEnded(() => {
      next();
    });

    return () => {
      audio.setOnEnded(null);
    };
  }, [audio, index, tracks]);

  return (
    <PlaybackContext.Provider
      value={{
        tracks,
        index,
        hasNext: tracks.slice(index + 1).some(isPlayable),
        hasPrev: tracks.slice(0, index).some(isPlayable),
        setQueue,
        next,
        prev,
        onTrackRemoved,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlayback must be used within PlaybackProvider");
  return ctx;
}
