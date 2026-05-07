import sql from "@/app/lib/db";
import { KenoTrx, KenoTrxKq, KenoTicket } from "./definitions";

const TICKETS = ["a", "b", "c", "d", "e", "f"] as const;

export function parseSoChon(s: string | null): number[] {
  if (!s) return [];
  return s.trim().split(/\s+/).map(Number).filter(Boolean);
}

export function formatSoChon(nums: number[]): string {
  return nums.map((n) => String(n).padStart(2, "0")).join(" ");
}

export function extractTickets(row: KenoTrx): KenoTicket[] {
  return TICKETS.map((t) => ({
    label: t.toUpperCase(),
    so_chon: (row[`so_chon_${t}` as keyof KenoTrx] as string) || "",
    gia: (row[`gia_${t}` as keyof KenoTrx] as number) || 0,
  })).filter((t) => t.so_chon.trim() !== "");
}

export async function fetchKenoTrxList(): Promise<KenoTrx[]> {
  return sql<KenoTrx[]>`
    SELECT * FROM public.kenotrx
    WHERE status = 'buy'
    ORDER BY last_update DESC
  `;
}

export async function fetchKenoTrxById(id: string): Promise<KenoTrx | null> {
  const rows = await sql<KenoTrx[]>`SELECT * FROM public.kenotrx WHERE id = ${id}`;
  return rows[0] ?? null;
}

export async function fetchLatestKy(): Promise<string> {
  const rows = await sql<{ ky: string }[]>`
    SELECT ky FROM public.kenokq ORDER BY ky DESC LIMIT 1
  `;
  if (!rows[0]) return "0000001";
  return String(parseInt(rows[0].ky.trim(), 10) + 1).padStart(7, "0");
}

export async function generateNextId(): Promise<string> {
  const rows = await sql<{ id: string }[]>`
    SELECT id FROM public.kenotrx ORDER BY id DESC LIMIT 1
  `;
  if (!rows[0]) return "00001";
  return String(parseInt(rows[0].id.trim(), 10) + 1).padStart(5, "0");
}

// ==================== COMPUTE KQ ON-THE-FLY ====================
export async function computeKenoTrxKq(id: string): Promise<KenoTrxKq[]> {
  const trx = await fetchKenoTrxById(id);
  if (!trx) return [];

  const tuKy = parseInt(trx.tu_ky.trim(), 10);
  const kyList = Array.from({ length: trx.so_ky }, (_, i) =>
    String(tuKy + i).padStart(7, "0")
  );

  const [kqRows, gtkeno] = await Promise.all([
    sql<{ ky: string; n20: string }[]>`
      SELECT ky, n20 FROM public.kenokq
      WHERE ky = ANY(${kyList})
      ORDER BY ky ASC
    `,
    sql<{
      trung: string;
      b01: number; b02: number; b03: number; b04: number; b05: number;
      b06: number; b07: number; b08: number; b09: number; b10: number;
    }[]>`SELECT * FROM public.kenogt`,
  ]);

  // Build gia thuong map
  const gtkMap: Record<string, Record<string, number>> = {};
  for (const g of gtkeno) {
    gtkMap[g.trung.trim()] = {
      b01: g.b01, b02: g.b02, b03: g.b03, b04: g.b04, b05: g.b05,
      b06: g.b06, b07: g.b07, b08: g.b08, b09: g.b09, b10: g.b10,
    };
  }

  const result: KenoTrxKq[] = [];

  for (const kqRow of kqRows) {
    const ky = kqRow.ky.trim();
    const n20Set = new Set(kqRow.n20.trim().split(/\s+/).map(Number));

    for (const t of TICKETS) {
      const soChon = trx[`so_chon_${t}` as keyof KenoTrx] as string | null;
      const gia = (trx[`gia_${t}` as keyof KenoTrx] as number | null) ?? 0;
      if (!soChon?.trim()) continue;

      const nums = parseSoChon(soChon);
      const soTrung = nums.filter((n) => n20Set.has(n));
      const soCnt = soTrung.length;
      const bacKey = "b" + String(nums.length).padStart(2, "0");
      const trungKey = "T" + String(soCnt).padStart(2, "0");
      const thuong = (gtkMap[trungKey]?.[bacKey] ?? 0) * gia;

      result.push({
        id, ngay: "", ky,
        ticket: t.toUpperCase(),
        so_chon: soChon, gia,
        so_trung: soTrung.map((n) => String(n).padStart(2, "0")).join(" "),
        so_cnt: soCnt, thuong,
      });
    }
  }

  return result;
}
