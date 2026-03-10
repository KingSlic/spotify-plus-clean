"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function EnergyFlowChart({ tracks }: any) {

  const data = tracks.map((track: any, i: number) => ({
    index: i + 1,
    energy: track.energy ?? Math.random(),
  }));

  return (
    <div className="w-full h-64 bg-zinc-900 rounded-lg p-4">
      <div className="text-sm text-zinc-400 mb-2">
        Cadence Flow Visualization
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="index" />
          <YAxis domain={[0,1]} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="energy"
            stroke="#1DB954"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
