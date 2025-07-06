import fetch from 'node-fetch';
import type { Resource } from './plan';

interface SkuRow {
  cloud    : string;
  region   : string;
  sku      : string;
  watts    : number;
  usd_hour : number;
}

export type Suggestion = Resource & {
  altSku   : string;
  deltaKg  : number;
  deltaUsd : number;
};

/* ---------- helper tables & functions --------------------------- */
const SIZE_DOWN: Record<string, string | undefined> = {
  nano: '-', micro: 'nano', small: 'micro', medium: 'small',
  large: 'medium', xlarge: 'large', '2xlarge': 'xlarge',
};

function downsize(sku: string): string {
  return sku.replace(
    /(nano|micro|small|medium|large|xlarge|2xlarge)/,
    m => SIZE_DOWN[m] ?? m,
  );
}

function lookup(table: Map<string, SkuRow>, provider: string, region: string, sku: string): SkuRow | undefined {
  return table.get(`${provider}/${region}/${sku}`);
}

function lookupAnyRegion(rows: SkuRow[], provider: string, sku: string): SkuRow | undefined {
  return rows.find(r => r.cloud === provider && r.sku === sku);
}

/* ---------- main suggest() -------------------------------------- */
export async function suggest(
  resources: Resource[],
  api: string,
  apiKey: string,
): Promise<Suggestion[]> {
  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined;
  const skus: SkuRow[] = await fetch(`${api}/v1/skus`, { headers }).then(r => r.json());

  const table = new Map(
    skus.map(s => [`${s.cloud}/${s.region}/${s.sku}`, s]),
  );

  return resources
    .map(resource => {
      const { provider, region, sku } = resource;
      const base = lookup(table, provider, region, sku);

      if (!base) return null;                         // unknown baseline → skip

      /* 1️⃣  Try AMD equivalent first (t3 → t3a) */
      let altSku = sku.replace(/^t3\./, 't3a.');
      let alt    = lookup(table, provider, region, altSku)
                ?? lookupAnyRegion(skus, provider, altSku);

      /* 2️⃣  If no AMD alt, downsize (“medium”→“small”, etc.) */
      if (!alt) {
        altSku = downsize(sku);
        alt    = lookup(table, provider, region, altSku)
              ?? lookupAnyRegion(skus, provider, altSku);
      }

      /* 3️⃣  Still nothing? bail out */
      if (!alt || alt === base) return null;

      // const deltaKg  = ((base.watts - alt.watts) / 1000) * 0.7;   // kg CO₂/month
      const deltaKg  = ((base.watts - alt.watts) * 730 / 1000) * 0.7;
      const deltaUsd = (base.usd_hour - alt.usd_hour) * 730;      // USD/month

      return { ...resource, altSku, deltaKg, deltaUsd };
    })
    .filter((s): s is Suggestion => !!s && s.deltaKg > 0.01);      // keep ≥ 10 g savings
}


// // import fetch from 'node-fetch';
// // import type { Resource } from './plan';

// // export type Suggestion = Resource & { altSku: string; deltaKg: number; deltaUsd: number };

// // export async function suggest(resources: Resource[], api: string): Promise<Suggestion[]> {
// //   const skus = await fetch(`${api}/v1/skus`).then(r => r.json());
// //   const table = new Map(skus.map((s: any) => [`${s.cloud}/${s.region}/${s.sku}`, s]));

// //   return resources.map(r => {
// //     const base = table.get(`${r.provider}/${r.region}/${r.sku}`)!;
// //     // naive greener choice: same family, "small" instead of "medium"
// //     const altSku = r.sku.replace(/medium/,'small');
// //     const alt    = table.get(`${r.provider}/${r.region}/${altSku}`) ?? base;

// //     const deltaKg  = ((base.watts - alt.watts) / 1000) * 0.7; // 0.7 kg/kWh default
// //     const deltaUsd = (base.usd_hour - alt.usd_hour) * 730;    // monthly

// //     return { ...r, altSku, deltaKg, deltaUsd };
// //   }).filter(s => s.deltaKg > 0.1);   // only if meaningful
// // }

// import fetch from 'node-fetch';
// import type { Resource } from './plan';

// interface SkuRow {
//   cloud: string;
//   region: string;
//   sku: string;
//   watts: number;
//   usd_hour: number;
// }

// export type Suggestion = Resource & {
//   altSku:   string;
//   deltaKg:  number;
//   deltaUsd: number;
// };

// export async function suggest(
//   resources: Resource[],
//   api: string
// ): Promise<Suggestion[]> {
//   // --- fix: tell TS the JSON shape -------------------------------▼
//   const skus = await fetch(`${api}/v1/skus`)
//     .then(res => res.json() as Promise<SkuRow[]>);

//   const table = new Map(
//     skus.map(s => [`${s.cloud}/${s.region}/${s.sku}`, s])
//   );

//   return resources
//     .map(r => {
//       const base = table.get(`${r.provider}/${r.region}/${r.sku}`)!;

//       const altSku = r.sku.replace(/medium/, 'small');
//       const alt    = table.get(`${r.provider}/${r.region}/${altSku}`) ?? base;

//       const deltaKg  = ((base.watts - alt.watts) / 1000) * 0.7;
//       const deltaUsd = (base.usd_hour - alt.usd_hour) * 730;

//       return { ...r, altSku, deltaKg, deltaUsd };
//     })
//     .filter(s => s.deltaKg > 0.1);
// }
