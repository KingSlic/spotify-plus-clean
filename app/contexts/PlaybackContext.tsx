"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Track = {
  id: string;
  preview_url: string | null;
};

type PlaybackContextType = {
  tracks: Track[];
  currentIndex: number;
  hasNext: boolean;
  hasPrev: boolean;

  setContext: (tracks: Track[], startIndex: number) => void;
  next: () => number | null;
  prev: () => number | null;
  removeTrack: (trackId: string) => void;
};

const PlaybackContext = createContext<PlaybackContextType | null>(null);

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  function setContext(tracks: Track[], startIndex: number) {
    setTracks(tracks);
    setCurrentIndex(startIndex);
  }

  function next() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= tracks.length) return null;
    setCurrentIndex(nextIndex);
    return nextIndex;
  }

  function prev() {
    const prevIndex = currentIndex - 1;
    if (prevIndex < 0) return null;
    setCurrentIndex(prevIndex);
    return prevIndex;
  }

  function removeTrack(trackId: string) {
    setTracks((prev) => {
      const idx = prev.findIndex((t) => t.id === trackId);
      if (idx === -1) return prev;

      const next = prev.filter((t) => t.id !== trackId);

      if (idx < currentIndex) {
        setCurrentIndex((i) => i - 1);
      } else if (idx === currentIndex) {
        setCurrentIndex((i) => (i >= next.length ? next.length - 1 : i));
      }

      return next;
    });
  }

  const value = useMemo(
    () => ({
      tracks,
      currentIndex,
      hasNext: currentIndex >= 0 && currentIndex < tracks.length - 1,
      hasPrev: currentIndex > 0,
      setContext,
      next,
      prev,
      removeTrack,
    }),
    [tracks, currentIndex],
  );

  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) {
    throw new Error("usePlayback must be used inside PlaybackProvider");
  }
  return ctx;
}
