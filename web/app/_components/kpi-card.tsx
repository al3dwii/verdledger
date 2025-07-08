import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function KpiCard() {
  const { data, error } = useSWR('/api/summary?org=1', fetcher, { refreshInterval: 30000 });

  if (error) return <div className="card">Error loading KPIs</div>;
  if (!data) return <div className="card animate-pulse">Loading…</div>;

  return (
    <div className="card">
      <h2 className="text-gray-500">CO₂ Avoided</h2>
      <p className="text-3xl font-semibold">{data.total_kg.toFixed(0)} kg</p>
    </div>
  );
}
