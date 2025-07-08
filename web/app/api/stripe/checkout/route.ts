import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase-client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function POST(req: NextRequest) {
  const { org_id } = await req.json();
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return new Response('unauth', { status: 401 });

  const checkout = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    metadata: { org_id }
  });
  return Response.json({ url: checkout.url });
}
