import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE')!);
const RESEND = Deno.env.get('RESEND_API');

serve(async _req => {
  const { data } = await sb.from('v_org_weekly').select('org_id, usd, kg');
  if (!data?.length) return new Response('OK');

  const { data: orgs } = await sb.from('org').select('id, name, email');

  for (const row of data) {
    const to = orgs!.find(o => o.id === row.org_id)?.email;
    if (!to) continue;

    const html = `
      <h1>🌱 VerdLedger Weekly Digest</h1>
      <p>You avoided <strong>${row.kg.toFixed(2)} kg</strong> CO₂ and saved <strong>$${row.usd.toFixed(2)}</strong> this week.</p>
      <p><a href="https://app.verdledger.dev/org/${row.org_id}/dashboard">View dashboard →</a></p>
      <hr><small>Unsubscribe in Settings.</small>
    `;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND}`
      },
      body: JSON.stringify({
        to,
        from: 'VerdLedger <hi@verdledger.dev>',
        subject: 'Your weekly carbon & cost savings',
        html
      })
    });
  }
  return new Response('sent');
});
