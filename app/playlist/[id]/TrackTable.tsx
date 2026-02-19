"use client";

import TrackRow from "@/app/components/TrackRow";

type Track = {
  id: string;
  title: string;
  duration_ms: number | null;
  preview_url: string | null;
  artists?: { id: string; name: string }[];
};

type Mode = "view" | "manage";

export default function TrackTable({
  tracks,
  mode,
  selected,
  setSelected,
  stagedSet,
  toggleMembership,
}: {
  tracks: Track[];
  mode: Mode;
  selected: Set<string>;
  setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
  stagedSet: Set<string>;
  toggleMembership: (trackId: string) => void;
}) {
  const allSelected = tracks.length > 0 && selected.size === tracks.length;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tracks.map((t) => t.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  }

  return (
    <table className="w-full border-separate table-fixed border-spacing-y-1">
      <thead>
        <tr className="text-neutral-400 text-sm">
          <th className="w-12 px-4 text-left">
            {mode === "manage" ? (
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 accent-green-500"
              />
            ) : (
              "#"
            )}
          </th>

          <th className="px-4 text-left">Title</th>

          <th className="w-14 px-4 text-right"></th>

          <th className="w-20 px-4 text-right">Duration</th>
        </tr>
      </thead>

      <tbody>
        {tracks.map((track, index) => (
          <TrackRow
            key={track.id}
            track={track}
            index={index}
            tracks={tracks}
            mode={mode}
            isSelected={selected.has(track.id)}
            toggleSelected={() => toggleOne(track.id)}
            stagedMembership={stagedSet.has(track.id)}
            toggleMembership={() => toggleMembership(track.id)}
          />
        ))}
      </tbody>
    </table>
  );
}
