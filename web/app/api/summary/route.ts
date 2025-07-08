import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/v1/summary${req.nextUrl.search}`;
  const res = await fetch(url);
  return new Response(await res.text(), { status: res.status });
}
