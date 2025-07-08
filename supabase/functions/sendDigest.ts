import { createClient } from 'supabase';
import * as Postmark from 'postmark';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const postmark = new Postmark.ServerClient(process.env.POSTMARK_TOKEN!);

export default async function handler() {
  const { data, error } = await supabase
    .rpc('ledger_summary_last_week');
  if (error) throw error;

  for (const row of data as any[]) {
    const { email, org_name, kg, prs } = row;

    await postmark.sendEmailWithTemplate({
      TemplateId: 397564,
      To: email,
      TemplateModel: {
        org_name,
        kg: kg.toFixed(1),
        prs,
        leaderboard_url: `https://app.verdledger.dev/ledger?org=${row.org_id}`
      }
    });
  }
  return new Response('ok');
}
