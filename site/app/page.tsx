'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Home() {
  const { data } = useSWR('/badge/_global.json', fetcher);

  return (
    <section className="text-center py-24">
      <h1 className="text-5xl font-extrabold mb-4">VerdLedger</h1>
      <p className="text-xl mb-8">Carbon-aware CI for Terraform &amp; Pulumi.</p>

      <div className="text-emerald-600 text-4xl font-bold">
        {data ? (data.total_kg).toLocaleString() : '…'} kg CO₂ avoided
      </div>

      <a href="https://github.com/verdledger/verdledger" className="mt-12 inline-block bg-emerald-600 text-white px-6 py-3 rounded">
        ⭐ Star on GitHub
      </a>
    </section>
  );
}
