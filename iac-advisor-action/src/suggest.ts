
// import fetch from 'node-fetch';
// import type { Resource } from './plan';

// export type Suggestion = Resource & { altSku: string; deltaKg: number; deltaUsd: number };

// export async function suggest(resources: Resource[], api: string): Promise<Suggestion[]> {
//   const skus = await fetch(`${api}/v1/skus`).then(r => r.json());
//   const table = new Map(skus.map((s: any) => [`${s.cloud}/${s.region}/${s.sku}`, s]));

//   return resources.map(r => {
//     const base = table.get(`${r.provider}/${r.region}/${r.sku}`)!;
//     // naive greener choice: same family, "small" instead of "medium"
//     const altSku = r.sku.replace(/medium/,'small');
//     const alt    = table.get(`${r.provider}/${r.region}/${altSku}`) ?? base;

//     const deltaKg  = ((base.watts - alt.watts) / 1000) * 0.7; // 0.7 kg/kWh default
//     const deltaUsd = (base.usd_hour - alt.usd_hour) * 730;    // monthly

//     return { ...r, altSku, deltaKg, deltaUsd };
//   }).filter(s => s.deltaKg > 0.1);   // only if meaningful
// }

import fetch from 'node-fetch';
import type { Resource } from './plan';

interface SkuRow {
  cloud: string;
  region: string;
  sku: string;
  watts: number;
  usd_hour: number;
}

export type Suggestion = Resource & {
  altSku:   string;
  deltaKg:  number;
  deltaUsd: number;
};

export async function suggest(
  resources: Resource[],
  api: string
): Promise<Suggestion[]> {
  // --- fix: tell TS the JSON shape -------------------------------▼
  const skus = await fetch(`${api}/v1/skus`)
    .then(res => res.json() as Promise<SkuRow[]>);

  const table = new Map(
    skus.map(s => [`${s.cloud}/${s.region}/${s.sku}`, s])
  );

  return resources
    .map(r => {
      const base = table.get(`${r.provider}/${r.region}/${r.sku}`)!;

      const altSku = r.sku.replace(/medium/, 'small');
      const alt    = table.get(`${r.provider}/${r.region}/${altSku}`) ?? base;

      const deltaKg  = ((base.watts - alt.watts) / 1000) * 0.7;
      const deltaUsd = (base.usd_hour - alt.usd_hour) * 730;

      return { ...r, altSku, deltaKg, deltaUsd };
    })
    .filter(s => s.deltaKg > 0.1);
}
