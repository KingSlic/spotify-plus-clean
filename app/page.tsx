import Link from "next/link";
import {
  fetchPlaylists,
  fetchSections,
} from "@/lib/api/server";

export default async function HomePage() {
  const playlists = await fetchPlaylists();
  const sections = await fetchSections();

  const playlistsById = Object.fromEntries(
    playlists.map((p: any) => [p.id, p])
  );

  return (
    <div className="p-6 space-y-10">
      {sections.map((section: any) => (
        <section key={section.id}>
          <h2 className="text-xl font-bold mb-4">
            {section.title}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {section.playlistIds.map((pid: string) => {
              const p = playlistsById[pid];
              if (!p) return null;

              return (
                <Link
                  key={p.id}
                  href={`/playlist/${p.id}`}
                  className="group bg-neutral-900 rounded-lg p-4 hover:bg-neutral-800 transition"
                >
                  <div className="aspect-square bg-neutral-800 rounded mb-3 flex items-center justify-center">
                    <span className="text-neutral-500 text-xs">
                      Cover
                    </span>
                  </div>

                  <h3 className="font-semibold truncate">
                    {p.name}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {p.description || p.type}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
