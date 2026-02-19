import GlobalPlayer from "@/app/components/player/GlobalPlayer";
import { AudioPlayerProvider } from "@/app/contexts/AudioPlayerContext";
import { PlaybackProvider } from "@/app/contexts/PlaybackContext";
import "./globals.css";

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
            <div className="flex min-h-screen pb-24">
              {/* SIDEBAR */}
              <aside className="w-64 bg-gradient-to-b from-neutral-950 to-black border-r border-neutral-800 flex flex-col px-6 py-6">
                <div className="text-2xl font-bold tracking-tight mb-10">
                  Spotify<span className="text-green-500">+</span>
                </div>

                <nav className="space-y-3 text-neutral-400 text-sm font-medium">
                  <a
                    href="/"
                    className="block px-3 py-2 rounded-md hover:bg-neutral-800 hover:text-white transition"
                  >
                    Home
                  </a>

                  <a
                    href="/search"
                    className="block px-3 py-2 rounded-md hover:bg-neutral-800 hover:text-white transition"
                  >
                    Search
                  </a>

                  <a
                    href="/library"
                    className="block px-3 py-2 rounded-md hover:bg-neutral-800 hover:text-white transition"
                  >
                    Your Library
                  </a>
                </nav>

                <div className="mt-auto pt-10 border-t border-neutral-800 text-xs text-neutral-500">
                  Playlist Intelligence Layer
                </div>
              </aside>

              {/* MAIN CONTENT */}
              <main className="flex-1 px-10 py-8">{children}</main>
            </div>

            {/* GLOBAL PLAYER */}
            <GlobalPlayer />
          </PlaybackProvider>
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
