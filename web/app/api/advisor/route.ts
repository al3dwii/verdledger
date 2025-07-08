import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/v1/advisor/advise`;
  const res = await fetch(url, { method: "POST", body: await req.text() });
  return new Response(await res.text(), { status: res.status });
}
