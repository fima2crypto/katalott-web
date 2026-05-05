import sql from '@/app/lib/db';
import { KenoKq, KenoKqRow } from './kenokq_definitions';

// ==================== CONSTANTS ====================
const PRIMES = new Set([
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79,
]);
const DOUBLES = new Set([11, 22, 33, 44, 55, 66, 77, 88]);
const VT_KEYS = [1, 2, 3, 5, 7, 9];

// ==================== HELPERS ====================
function parseNums(s: string | null): number[] {
  if (!s) return [];
  return s.trim().split(/\s+/).map(Number).filter(Boolean);
}

function parseBacString(s: string | null): Record<string, number> {
  const result: Record<string, number> = {};
  if (!s) return result;
  for (const part of s.trim().split(',')) {
    const [yy, zz] = part.trim().split('-');
    if (yy && zz) result[`T${yy.padStart(2, '0')}`] = parseInt(zz);
  }
  return result;
}

function checkJackpot(row: KenoKq): { jackpot_green: boolean; jackpot_red: boolean; bac_trung: number[] } {
  let green = false;
  let red = false;
  const bac_trung: number[] = [];

  for (let i = 5; i <= 10; i++) {
    const col = `b${String(i).padStart(2, '0')}` as keyof KenoKq;
    const raw = row[col] as string | null;
    const bacData = parseBacString(raw);
    const key = `T${String(i).padStart(2, '0')}`;
    if ((bacData[key] ?? 0) > 0) {
      bac_trung.push(i);
      if (i <= 7) green = true;
      else red = true;
    }
  }
  return { jackpot_green: green, jackpot_red: red, bac_trung };
}

function computeStats(nums: number[], prevNums: number[]): Omit<KenoKqRow,
  'thu' | 'ngay' | 'gio' | 'ky' | 'nums' | 'jackpot_green' | 'jackpot_red' | 'bac_trung'> {

  const prevSet = new Set(prevNums);

  const g0 = nums.filter(n => prevSet.has(n));
  const xx = nums.filter(n => DOUBLES.has(n));
  const snt = nums.filter(n => PRIMES.has(n));

  // HT0-HT7: SNT theo hang chuc
  const ht: Record<string, number> = {};
  for (let i = 0; i < 8; i++) {
    ht[`ht${i}`] = snt.filter(n => Math.floor(n / 10) === i).length;
  }

  // VT1,2,3,5,7,9: SNT theo hang don vi
  const vt: Record<string, number> = {};
  for (const i of VT_KEYS) {
    vt[`vt${i}`] = snt.filter(n => n % 10 === i).length;
  }

  // H0-H8: tat ca 20 so theo hang chuc
  const h: Record<string, number> = {};
  for (let i = 0; i < 9; i++) {
    h[`h${i}`] = nums.filter(n => Math.floor(n / 10) === i).length;
  }

  // V0-V9: tat ca 20 so theo hang don vi
  const v: Record<string, number> = {};
  for (let i = 0; i < 10; i++) {
    v[`v${i}`] = nums.filter(n => n % 10 === i).length;
  }

  return {
    g0, g0_count: g0.length,
    xx, xx_count: xx.length,
    snt, snt_count: snt.length,
    ht0: ht.ht0, ht1: ht.ht1, ht2: ht.ht2, ht3: ht.ht3,
    ht4: ht.ht4, ht5: ht.ht5, ht6: ht.ht6, ht7: ht.ht7,
    vt1: vt.vt1, vt2: vt.vt2, vt3: vt.vt3,
    vt5: vt.vt5, vt7: vt.vt7, vt9: vt.vt9,
    h0: h.h0, h1: h.h1, h2: h.h2, h3: h.h3, h4: h.h4,
    h5: h.h5, h6: h.h6, h7: h.h7, h8: h.h8,
    v0: v.v0, v1: v.v1, v2: v.v2, v3: v.v3, v4: v.v4,
    v5: v.v5, v6: v.v6, v7: v.v7, v8: v.v8, v9: v.v9,
  };
}

function rowToKenoKqRow(row: KenoKq, prevNums: number[]): KenoKqRow {
  const nums = parseNums(row.n20);
  const stats = computeStats(nums, prevNums);
  const jp = checkJackpot(row);
  return {
    thu: row.thu?.trim() ?? '',
    ngay: String(row.ngay),
    gio: row.gio?.trim() ?? '',
    ky: row.ky?.trim() ?? '',
    nums,
    ...stats,
    ...jp,
  };
}

// ==================== FETCH ====================
export async function fetchKenoKqList(params: {
  tu_ngay?: string;
  den_ngay?: string;
  limit?: number;
}): Promise<KenoKqRow[]> {
  const { tu_ngay, den_ngay, limit = 20 } = params;

  let rows: KenoKq[];

  if (tu_ngay && den_ngay) {
    rows = await sql<KenoKq[]>`
      SELECT * FROM public.kenokq
      WHERE ngay BETWEEN ${tu_ngay} AND ${den_ngay}
      ORDER BY ky DESC
    `;
  } else if (tu_ngay) {
    rows = await sql<KenoKq[]>`
      SELECT * FROM public.kenokq
      WHERE ngay >= ${tu_ngay}
      ORDER BY ky DESC
    `;
  } else if (den_ngay) {
    rows = await sql<KenoKq[]>`
      SELECT * FROM public.kenokq
      WHERE ngay <= ${den_ngay}
      ORDER BY ky DESC
    `;
  } else {
    rows = await sql<KenoKq[]>`
      SELECT * FROM public.kenokq
      ORDER BY ky DESC
      LIMIT ${limit}
    `;
  }

  // Tinh stats voi prev_nums
  const result: KenoKqRow[] = [];
  for (let i = 0; i < rows.length; i++) {
    const prevNums = i + 1 < rows.length ? parseNums(rows[i + 1].n20) : [];
    result.push(rowToKenoKqRow(rows[i], prevNums));
  }
  return result;
}
