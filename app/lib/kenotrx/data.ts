import sql from "@/app/lib/db";
import { KenoTrx, KenoTrxKq, KenoTicket } from "./definitions";

const TICKETS = ["a", "b", "c", "d", "e", "f"] as const;

// ==================== HELPERS ====================

/**
 * Parse so_chon string -> array of numbers
 * "04 08 12" -> [4, 8, 12]
 */
export function parseSoChon(s: string | null): number[] {
  if (!s) return [];
  return s.trim().split(/\s+/).map(Number).filter(Boolean);
}

/**
 * Format array of numbers -> so_chon string
 * [4, 8, 12] -> "04 08 12"
 */
export function formatSoChon(nums: number[]): string {
  return nums.map((n) => String(n).padStart(2, "0")).join(" ");
}

/**
 * Extract tickets tu 1 row KenoTrx
 */
export function extractTickets(row: KenoTrx): KenoTicket[] {
  return TICKETS.map((t) => ({
    label: t.toUpperCase(),
    so_chon: (row[`so_chon_${t}` as keyof KenoTrx] as string) || "",
    gia: (row[`gia_${t}` as keyof KenoTrx] as number) || 0,
  })).filter((t) => t.so_chon.trim() !== "");
}

// ==================== FETCH ====================

/**
 * Lay danh sach ve dang buy
 */
export async function fetchKenoTrxList(): Promise<KenoTrx[]> {
  const rows = await sql<KenoTrx[]>`
    SELECT * FROM public.kenotrx
    WHERE status = 'buy'
    ORDER BY last_update DESC
  `;
  return rows;
}

/**
 * Lay 1 ve theo id
 */
export async function fetchKenoTrxById(id: string): Promise<KenoTrx | null> {
  const rows = await sql<KenoTrx[]>`
    SELECT * FROM public.kenotrx
    WHERE id = ${id}
  `;
  return rows[0] ?? null;
}

/**
 * Lay ky moi nhat tu kqkeno, +1 lam default cho tu_ky
 */
export async function fetchLatestKy(): Promise<string> {
  const rows = await sql<{ ky: string }[]>`
    SELECT ky FROM public.kenokq
    ORDER BY ky DESC
    LIMIT 1
  `;
  if (!rows[0]) return "0000001";
  const latest = parseInt(rows[0].ky.trim(), 10);
  return String(latest + 1).padStart(7, "0");
}

/**
 * Lay ket qua kq theo id
 */
export async function fetchKenoTrxKq(id: string): Promise<KenoTrxKq[]> {
  const rows = await sql<KenoTrxKq[]>`
    SELECT * FROM public.kenotrxkq
    WHERE id = ${id}
    ORDER BY ky ASC, ticket ASC
  `;
  return rows;
}

/**
 * Generate id moi: lay id lon nhat + 1
 */
export async function generateNextId(): Promise<string> {
  const rows = await sql<{ id: string }[]>`
    SELECT id FROM public.kenotrx
    ORDER BY id DESC
    LIMIT 1
  `;
  if (!rows[0]) return "00001";
  const latest = parseInt(rows[0].id.trim(), 10);
  return String(latest + 1).padStart(5, "0");
}
