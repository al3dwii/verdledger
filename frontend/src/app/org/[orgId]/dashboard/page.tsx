import { fetchSummary } from '@/lib/verdledger';
import KpiTile from '@/components/KpiTile';
import LedgerTable from '@/components/LedgerTable.client';
import ApiKeyBlock from '@/components/ApiKeyBlock.client';

export default async function Dashboard({ params }: { params: { orgId: string } }) {
  const orgId = Number(params.orgId);
  const kpi = await fetchSummary(orgId);

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      {/* KPI section */}
      <section className="grid gap-4 sm:grid-cols-2">
        <KpiTile label="CO₂ avoided" value={`${kpi.total_kg.toFixed(2)} kg`} />
        <KpiTile label="Money saved" value={`$${kpi.total_usd.toFixed(2)}`} />
      </section>

      {/* Ledger table */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Latest ledger events</h2>
        <LedgerTable orgId={orgId} limit={25} />
      </section>

      {/* API key */}
      <ApiKeyBlock orgId={orgId} />
    </main>
  );
}
