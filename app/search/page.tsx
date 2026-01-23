"use client";

import { useEffect, useState } from "react";
import { searchAll } from "@/lib/api/server";
import PlaylistCard from "@/app/components/PlaylistCard";
import TrackRow from "@/app/components/TrackRow";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (!query) {
      setResults(null);
      return;
    }

    searchAll(query).then(setResults);
  }, [query]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Search</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What do you want to listen to?"
        className="w-full p-3 rounded bg-neutral-800 text-white mb-8"
      />

      {results?.playlists?.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Playlists</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {results.playlists.map((p: any) => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </div>
        </>
      )}

      {results?.tracks?.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Tracks</h2>
          <div className="divide-y divide-neutral-800">
            {results.tracks.map((t: any, i: number) => (
              <TrackRow key={t.id} track={t} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
