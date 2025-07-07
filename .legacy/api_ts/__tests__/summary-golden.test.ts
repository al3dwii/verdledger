// summary-golden.test.ts
import { expect, it } from 'vitest';
import { buildServer } from '../api/server';
import fs from 'node:fs';
import path from 'node:path';

const GOLDEN = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../testdata/summary.golden.json'), 'utf8')
);

it('summary endpoint matches golden snapshot', async () => {
  const app   = buildServer();
  const res   = await app.inject('/v1/summary?org=1&limit=10');
  const ACTUAL = JSON.parse(res.payload);

  // Deep structural diff.  The test will fail on *any* change.
  expect(ACTUAL).toEqual(GOLDEN);

  await app.close();
});
