import { createClient } from '@/utils/supabase-client';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  return await supabase.auth.api.handleAuthCallback(req);
}
