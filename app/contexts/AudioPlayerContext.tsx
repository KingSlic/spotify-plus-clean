"use client";

import { createContext, useContext, useRef, useState } from "react";

type AudioContextType = {
  play: (url: string, track: any) => void;
  pause: () => void;
  currentTrack: any | null;
  isPlaying: boolean;
};

const AudioPlayerContext = createContext<AudioContextType | null>(null);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = (url: string, track: any) => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
    } else {
      audioRef.current.src = url;
    }

    audioRef.current.play();
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  return (
    <AudioPlayerContext.Provider value={{ play, pause, currentTrack, isPlaying }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used inside provider");
  return ctx;
}
