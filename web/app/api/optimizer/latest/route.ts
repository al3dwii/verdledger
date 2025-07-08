import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/v1/optimizer/suggest`;
  const res = await fetch(url, { method: "POST", body: "{}" });
  return new Response(await res.text(), { status: res.status });
}
