import { AudioPlayerProvider } from "@/app/contexts/AudioPlayerContext";
import GlobalPlayer from "@/app/components/player/GlobalPlayer";
import Sidebar from "@/app/components/Sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <AudioPlayerProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 min-h-screen pb-24">{children}</main>
          </div>
          <GlobalPlayer />
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
