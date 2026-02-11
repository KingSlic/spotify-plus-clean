"use client";

import "./globals.css";

import Sidebar from "@/app/components/Sidebar";
import GlobalPlayer from "@/app/components/player/GlobalPlayer";
import { AudioPlayerProvider } from "@/app/contexts/AudioPlayerContext";
import { PlaybackProvider, usePlayback } from "@/app/contexts/PlaybackContext";

function AppShell({ children }: { children: React.ReactNode }) {
  const playback = usePlayback();

  return (
    <>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen pb-24">{children}</main>
      </div>
      <GlobalPlayer />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <AudioPlayerProvider>
          <PlaybackProvider>
            <AppShell>{children}</AppShell>
          </PlaybackProvider>
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
