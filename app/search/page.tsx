"use client";

import { useEffect, useState } from "react";
import { searchAll } from "@/lib/api/client";
import PlaylistCard from "@/app/components/PlaylistCard";
import TrackRow from "@/app/components/TrackRow";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    tracks: any[];
    playlists: any[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Spotify-style guard: don’t search on 0–1 chars
    if (!query || query.length < 2) {
      setResults(null);
      setError(null);
      return;
    }

    let cancelled = false;

    searchAll(query)
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResults(null);
          setError("Search failed");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-6">Search</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What do you want to listen to?"
        className="w-full p-3 rounded bg-neutral-800 text-white mb-4 outline-none focus:ring-2 focus:ring-white/30"
      />

      {error && <p className="text-red-500 mb-6">{error}</p>}

      {results?.playlists?.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Playlists</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {results.playlists.map((p) => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </div>
        </>
      )}

      {results?.tracks?.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Tracks</h2>
          <div className="divide-y divide-neutral-800">
            {results.tracks.map((t, i) => (
              <TrackRow key={t.id} track={t} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
