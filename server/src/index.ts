import express from 'express';
import { createClient } from '@supabase/supabase-js';

const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
app.use(express.json());

app.get('/v1/skus', async (_req, res) => {
  const { data, error } = await supabase.from('sku_catalogue').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/v1/events', async (_req, res) => {
  const { data, error } = await supabase.from('savings_event').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/v1/summary', async (_req, res) => {
  const { data, error } = await supabase
    .from('savings_event')
    .select('org_id, sum(kwh) as kwh, sum(kg) as kg, sum(usd) as usd')
    .group('org_id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`VerdLedger API listening on port ${PORT}`);
});
