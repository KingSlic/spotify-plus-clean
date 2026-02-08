import HomeSection from "@/app/components/HomeSection";
import { fetchPlaylists, fetchSections } from "@/lib/api/server";
import { Playlist } from "@/lib/types/playlist";


function playlistsForSection(
  sectionId: string,
  playlists: Playlist[],
): Playlist[] {
  switch (sectionId) {
    case "made_for_you":
      return playlists.filter(
        (p) => p.type === "DailyMix" || p.type === "Radar",
      );

    case "discover":
      return playlists.filter((p) => p.type === "Discover");

    case "recent":
      return playlists.slice(0, 6);

    default:
      return [];
  }
}

export default async function HomePage() {
  const sections = await fetchSections();
  const playlists = await fetchPlaylists();

  return (
    <div className="p-8 space-y-12">
      {sections
        .sort((a: any, b: any) => a.order - b.order)
        .map((section: any) => {
          const sectionPlaylists = playlistsForSection(section.id, playlists);

          if (!sectionPlaylists.length) return null;

          return (
            <HomeSection
              key={section.id}
              title={section.title}
              playlists={sectionPlaylists}
            />
          );
        })}
    </div>
  );
}
