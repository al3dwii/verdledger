import { fetchSummary, fetchActiveRepos } from '@/lib/verdledger';
import KpiTile from '@/components/KpiTile';
import LedgerTable from '@/components/LedgerTable.client';
import ApiKeyBlock from '@/components/ApiKeyBlock.client';

/** Utility: Next 15 “lazy params” is both the data and its promise */
type LazyParams<T> = T & Promise<T>;

export default async function Dashboard({
  params,
}: {
  params: LazyParams<{ orgId: string }>;
}) {
  /* --- get org id ------------------------------------------------ */
  const { orgId } = await params;           // e.g. "1"
  const id = Number(orgId);

  /* --- DB summary ------------------------------------------------ */
  const summary = await fetchSummary(id);   // { total_kg, total_usd }
  const active  = await fetchActiveRepos();

  /* --- render ---------------------------------------------------- */
  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      {/* KPI tiles */}
      <section className="grid gap-4 sm:grid-cols-3">
        <KpiTile
          label="CO₂ avoided"
          value={`${summary.total_kg.toFixed(2)} kg`}
          testId="kpi-co2"
        />
        <KpiTile
          label="Money saved"
          value={`$${summary.total_usd.toFixed(2)}`}
          testId="kpi-money"
        />
        <KpiTile
          label="Active repos"
          value={String(active)}
          testId="kpi-active"
        />
      </section>

      {/* Latest ledger events */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Latest ledger events</h2>
        <LedgerTable orgId={id} limit={25} />
      </section>

      {/* API-key block */}
      <ApiKeyBlock orgId={id} />
    </main>
  );
}

