import fs from 'fs';

export type Resource = {
  provider : string;   // "aws"
  region   : string;   // "eu-central-1"
  sku      : string;   // "t3.medium"
};

export function parsePlan(path: string): Resource[] {
  if (!fs.existsSync(path)) {
    throw new Error(`Plan file not found: ${path}`);
  }
  const plan = JSON.parse(fs.readFileSync(path, 'utf8'));
  const out: Resource[] = [];

  (plan.resource_changes ?? []).forEach((rc: any) => {
    if (!rc.change?.after || !rc.change.actions?.includes('create')) return;

    const provider = rc.address.split('.')[0].split('_')[0];          // "aws"
    const az       = rc.change.after.availability_zone ?? '';         // "eu-central-1a"
    const region   = az.replace(/[a-z]$/, '');                        // "eu-central-1"

    out.push({
      provider,
      region,
      sku: rc.change.after.instance_type || 'unknown',
    });
  });

  return out;
}


// import fs from 'fs';

// export type Resource = {
//   provider: string;            // "aws"
//   region:   string;            // "eu-central-1"
//   sku:      string;            // "t3.medium"
// };

// export function parsePlan(path: string): Resource[] {
//   const plan = JSON.parse(fs.readFileSync(path,'utf8'));
//   const resources: Resource[] = [];

//   plan.resource_changes?.forEach((rc: any) => {
//     if (rc.change.actions.includes('create')) {
//       const provReg = rc.address.split('.')[0];
//       const provider = provReg.split('_')[0];
//       resources.push({
//         provider,
//         region:  rc.change.after.availability_zone.replace(/[a-z]$/,''),
//         sku:     rc.change.after.instance_type
//       });
//     }
//   });
//   return resources;
// }
