import { fetchSummary } from '@/lib/verdledger';
import KpiTile     from '@/components/KpiTile';
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

  /* --- render ---------------------------------------------------- */
  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      {/* KPI tiles */}
      <section className="grid gap-4 sm:grid-cols-2">
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

// import { fetchSummary } from '@/lib/verdledger';
// import KpiTile     from '@/components/KpiTile';
// import LedgerTable from '@/components/LedgerTable.client';
// import ApiKeyBlock from '@/components/ApiKeyBlock.client';

// /** Utility: “lazy params” is both the data and a promise for the data */
// type LazyParams<T> = T & Promise<T>;

// export default async function Dashboard({
//   params,
// }: {
//   params: LazyParams<{ orgId: string }>;
// }) {
//   // ⬇️  await the object itself – no more warning, no TypeError
//   const { orgId } = await params;
//   const id = Number(orgId);

//   const summary = await fetchSummary(id);

//   return (
//     <main className="mx-auto max-w-6xl p-6 space-y-8">
//       {/* KPI tiles */}
//       <section className="grid gap-4 sm:grid-cols-2">
//         <KpiTile label="CO₂ avoided" value={`${summary.total_kg.toFixed(2)} kg`} />
//         <KpiTile label="Money saved"  value={`$${summary.total_usd.toFixed(2)}`} />
//       </section>

//       {/* Latest ledger events */}
//       <section>
//         <h2 className="text-lg font-semibold mb-2">Latest ledger events</h2>
//         <LedgerTable orgId={id} limit={25} />
//       </section>

//       {/* API-key block */}
//       <ApiKeyBlock orgId={id} />
//     </main>
//   );
// }

// import { fetchSummary } from '@/lib/verdledger';
// import KpiTile from '@/components/KpiTile';
// import LedgerTable from '@/components/LedgerTable.client';
// import ApiKeyBlock from '@/components/ApiKeyBlock.client';

// export default async function Dashboard({ params }: { params: { orgId: string } }) {
//   const orgId = Number(params.orgId);
//   const kpi = await fetchSummary(orgId);

//   return (
//     <main className="mx-auto max-w-6xl p-6 space-y-8">
//       {/* KPI section */}
//       <section className="grid gap-4 sm:grid-cols-2">
//         <KpiTile label="CO₂ avoided" value={`${kpi.total_kg.toFixed(2)} kg`} />
//         <KpiTile label="Money saved" value={`$${kpi.total_usd.toFixed(2)}`} />
//       </section>

//       {/* Ledger table */}
//       <section>
//         <h2 className="text-lg font-semibold mb-2">Latest ledger events</h2>
//         <LedgerTable orgId={orgId} limit={25} />
//       </section>

//       {/* API key */}
//       <ApiKeyBlock orgId={orgId} />
//     </main>
//   );
// }

