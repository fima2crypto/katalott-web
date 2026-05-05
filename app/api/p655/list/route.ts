import { NextRequest, NextResponse } from "next/server";
import { fetchP655List } from "@/app/lib/p655/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const qh_ky = parseInt(searchParams.get("qh_ky") || "20");

  try {
    // Truyen limit=9999 de fetch full history
    const data = await fetchP655List({ limit: 9999, qh_ky });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}