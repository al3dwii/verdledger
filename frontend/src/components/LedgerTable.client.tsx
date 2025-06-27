'use client';
import useSWR from 'swr';
import { fetchLedger } from '@/lib/verdledger';

export default function LedgerTable({ orgId, limit = 25 }: { orgId: number; limit?: number }) {
  const { data, error, isLoading } = useSWR(['ledger', orgId], () => fetchLedger(orgId, limit));

  if (isLoading) return <p>Loading…</p>;
  if (error)     return <p className="text-red-600">Error loading events</p>;

  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 sticky top-0">
          <tr>
            <th className="px-2 py-1">Timestamp</th>
            <th className="px-2 py-1">Region</th>
            <th className="px-2 py-1">SKU</th>
            <th className="px-2 py-1 text-right">kg CO₂</th>
            <th className="px-2 py-1 text-right">$ Saved</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((e: any) => (
            <tr key={e.id} className="odd:bg-white even:bg-slate-50">
              <td className="px-2 py-1">{new Date(e.ts).toLocaleString()}</td>
              <td className="px-2 py-1">{e.region}</td>
              <td className="px-2 py-1">{e.sku}</td>
              <td className="px-2 py-1 text-right">{e.kg.toFixed(2)}</td>
              <td className="px-2 py-1 text-right">${e.usd.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
