"use client";
import useSWR from "swr";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function Optimizer() {
  const { data } = useSWR("/api/optimizer/latest", fetcher);
  if (!data) return <>Loading…</>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Realtime Grid Optimizer</h1>
      <p>
        Best slot: <strong>{data.best_region}</strong> at{" "}
        {new Date(data.start_iso).toLocaleString()}
      </p>
      <p>
        Estimated saving: <strong>{data.kg_saved.toFixed(1)} kg CO₂</strong>
      </p>
    </div>
  );
}
