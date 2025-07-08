import dynamic from 'next/dynamic';
const Kpi = dynamic(() => import('./_components/kpi-card'), { ssr: false });

export default function Dashboard() {
  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Kpi />
      {/* Future: Δ Cost, Green Commits */}
    </section>
  );
}
