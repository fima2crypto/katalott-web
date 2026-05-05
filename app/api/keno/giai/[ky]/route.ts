import { NextResponse } from "next/server";
import sql from "@/app/lib/db";

const BACS = [
  "b01",
  "b02",
  "b03",
  "b04",
  "b05",
  "b06",
  "b07",
  "b08",
  "b09",
  "b10",
];

function parseBacString(s: string | null): Record<string, number> {
  const result: Record<string, number> = {};
  if (!s) return result;
  for (const part of s.trim().split(",")) {
    const [yy, zz] = part.trim().split("-");
    if (yy && zz) result[`T${yy.padStart(2, "0")}`] = parseInt(zz);
  }
  return result;
}

function computeBtt(
  bacData: Record<string, number>,
  gtkMap: Record<string, Record<string, number>>,
  bacNum: number,
): number {
  const col = `b${String(bacNum).padStart(2, "0")}`;
  let total = 0;
  for (const [trungKey, sl] of Object.entries(bacData)) {
    const donGia = gtkMap[trungKey]?.[col] ?? 0;
    if (donGia && sl) total += donGia * sl;
  }
  return total;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ky: string }> },
) {
  const { ky } = await params;

  try {
    // Lay row keno
    const rows = await sql<any[]>`
      SELECT * FROM public.kenokq WHERE ky = ${ky}
    `;
    if (!rows[0]) {
      return NextResponse.json(
        { error: "Không tìm thấy kỳ này" },
        { status: 404 },
      );
    }
    const row = rows[0];

    // Lay bang kenogt
    const kenogt = await sql<any[]>`SELECT * FROM public.kenogt`;
    const gtkMap: Record<string, Record<string, number>> = {};
    for (const g of kenogt) {
      gtkMap[g.trung.trim()] = {
        b01: g.b01,
        b02: g.b02,
        b03: g.b03,
        b04: g.b04,
        b05: g.b05,
        b06: g.b06,
        b07: g.b07,
        b08: g.b08,
        b09: g.b09,
        b10: g.b10,
      };
    }

    // Tinh BTT tung bac
    let btt_tong = 0;
    const bacs: Record<string, any> = {};

    for (let i = 1; i <= 10; i++) {
      const col = `b${String(i).padStart(2, "0")}`;
      const raw = row[col] as string | null;
      const bacData = parseBacString(raw);
      const btt = computeBtt(bacData, gtkMap, i);
      btt_tong += btt;
      bacs[col] = { btt, trungs: bacData };
    }

    return NextResponse.json({
      ngay: row.ngay,
      gio: row.gio?.trim(),
      ky: row.ky?.trim(),
      btt_tong,
      bacs,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
