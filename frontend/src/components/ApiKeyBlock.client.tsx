'use client';
import { useState } from 'react';
import { createApiKey } from '@/lib/verdledger';

export default function ApiKeyBlock({ orgId }: { orgId: number }) {
  const [key, setKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const { secret } = await createApiKey(orgId);
      setKey(secret);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border rounded-md p-4 bg-slate-50">
      <h2 className="font-semibold mb-2">Install IaC Advisor</h2>

      {!key ? (
        <button disabled={busy} onClick={handleClick} className="btn-primary">
          {busy ? 'Generating…' : 'Generate API Key'}
        </button>
      ) : (
        <>
          <pre className="bg-slate-900 text-white text-sm p-3 rounded mb-2">
- uses: verdledger/iac-advisor-action@v0.1.0
  with:
    api-url: https://api.verdledger.dev
    api-key: {key}
          </pre>
          <p className="text-xs text-slate-600">
            Copy this into your <code>.github/workflows/*.yml</code> file.
          </p>
        </>
      )}
    </div>
  );
}
