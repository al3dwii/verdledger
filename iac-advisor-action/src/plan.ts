import fs from 'fs';

export type Resource = {
  provider: string;            // "aws"
  region:   string;            // "eu-central-1"
  sku:      string;            // "t3.medium"
};

export function parsePlan(path: string): Resource[] {
  const plan = JSON.parse(fs.readFileSync(path,'utf8'));
  const resources: Resource[] = [];

  plan.resource_changes?.forEach((rc: any) => {
    if (rc.change.actions.includes('create')) {
      const provReg = rc.address.split('.')[0];
      const provider = provReg.split('_')[0];
      resources.push({
        provider,
        region:  rc.change.after.availability_zone.replace(/[a-z]$/,''),
        sku:     rc.change.after.instance_type
      });
    }
  });
  return resources;
}
