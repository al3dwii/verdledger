import { parsePlan } from '../src/plan';
import { describe, expect, it } from 'vitest';
import fs from 'fs';

const planPath = __dirname + '/plan.json';
fs.writeFileSync(planPath, JSON.stringify({
  resource_changes: [
    {
      address: 'aws_instance.demo',
      change: {
        actions: ['create'],
        after: {
          availability_zone: 'us-west-2b',
          instance_type: 't3.medium'
        }
      }
    }
  ]
}));

describe('parsePlan', () => {
  it('extracts create resources', () => {
    const res = parsePlan(planPath);
    expect(res).toEqual([
      { provider: 'aws', region: 'us-west-2', sku: 't3.medium' }
    ]);
  });
});
