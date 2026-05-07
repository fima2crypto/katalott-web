import sql from '@/app/lib/db';
import { L535Kq, L535Row } from './definitions';

// ── constants ─────────────────────────────────────────────────────────────────

const PRIMES = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]);
const ALL_NUMS = Array.from({ length: 35 }, (_, i) => i + 1);

// ── parse helpers ─────────────────────────────────────────────────────────────

function parseNum(s: string | null): number {
  if (!s) return 0;
  return parseInt(s.trim(), 10) || 0;
}

function isEven(n: number) { return n % 2 === 0; }

function getN15(row: L535Kq): number[] {
  return [parseNum(row.n1), parseNum(row.n2), parseNum(row.n3),
          parseNum(row.n4), parseNum(row.n5)];
}

// ── compute helpers ───────────────────────────────────────────────────────────

function computeKe(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  let count = 0;
  for (let i = 0; i < sorted.length - 1; i++)
    if (sorted[i + 1] - sorted[i] === 1) count++;
  return count;
}

function computeMod(nums: number[]): string {
  const unitMap: Record<number, number[]> = {};
  for (const n of nums) {
    const unit = n % 10;
    if (!unitMap[unit]) unitMap[unit] = [];
    unitMap[unit].push(n);
  }
  return Object.entries(unitMap)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .filter(([, arr]) => arr.length >= 2)
    .map(([unit, arr]) => `${unit}${arr.length}`)
    .join(',');
}

function computeLevel(n15: number[]): string {
  return [0, 1, 2, 3]
    .map(d => n15.filter(n => Math.floor(n / 10) === d).length)
    .join('');
}

function compute5CL(n15: number[]): string {
  return n15.map(n => isEven(n) ? 'C' : 'L').join('');
}

function computeDBx(n6: number): 'X' | 'Y' | 'Z' {
  if (n6 >= 1 && n6 <= 4) return 'X';
  if (n6 >= 5 && n6 <= 8) return 'Y';
  return 'Z';
}

function computePatternCnt(val: string, cache: string[], idx: number): number | null {
  for (let j = idx + 1; j < cache.length; j++) {
    if (cache[j] === val) return j - idx;
  }
  return null;
}

function computeJPP(n15: number[], allRows: L535Kq[], idx: number): number | null {
  const target = new Set(n15);
  const union  = new Set<number>();
  for (let j = idx + 1; j < allRows.length; j++) {
    getN15(allRows[j]).forEach(v => union.add(v));
    if ([...target].every(n => union.has(n))) return j - idx;
  }
  return null;
}

function computeQHL(allRows: L535Kq[], idx: number, qhKy: number): number[] {
  const seen = new Set<number>();
  const end  = Math.min(idx + qhKy, allRows.length - 1);
  for (let j = idx + 1; j <= end; j++)
    getN15(allRows[j]).forEach(v => seen.add(v));
  return ALL_NUMS.filter(n => !seen.has(n));
}

function computeJPCK(allRows: L535Kq[], idx: number): number {
  for (let j = idx; j < allRows.length; j++)
    if ((allRows[j].dd_cnt ?? 0) > 0) return j - idx;
  return allRows.length - idx;
}

function computeJPMatch(
  n15: number[], allRows: L535Kq[], idx: number
): { info: string; cnt: number } {
  const target = new Set(n15);
  let bestCnt = 0;
  let bestJ   = -1;
  for (let j = idx + 1; j < allRows.length; j++) {
    const cnt = getN15(allRows[j]).filter(n => target.has(n)).length;
    if (cnt > bestCnt) { bestCnt = cnt; bestJ = j; }
  }
  if (bestJ === -1 || bestCnt === 0) return { info: '', cnt: 0 };
  const r    = allRows[bestJ];
  const ky   = r.ky?.trim() ?? '';
  const nums = getN15(r);
  const lech = bestJ - idx;
  return { info: `${lech} (${ky}: ${nums.join('-')})`, cnt: bestCnt };
}

function computeStats(n15: number[], n6: number, prevN15: number[]) {
  const dec0 = n15.filter(n => Math.floor(n / 10) === 0).length;
  const dec1 = n15.filter(n => Math.floor(n / 10) === 1).length;
  const dec2 = n15.filter(n => Math.floor(n / 10) === 2).length;
  const dec3 = n15.filter(n => Math.floor(n / 10) === 3).length;

  const dd: L535Row['dd'] = isEven(n15[0])
    ? (isEven(n15[4]) ? 'CC' : 'CL')
    : (isEven(n15[4]) ? 'LC' : 'LL');

  const dbx  = computeDBx(n6);
  const dbdd: 'C' | 'L' = isEven(n6) ? 'C' : 'L';

  const sc  = n15.filter(isEven).length;
  const presentDecs = new Set(n15.map(n => Math.floor(n / 10)));
  const cam = [0, 1, 2, 3].filter(d => !presentDecs.has(d)).join(',');

  const snt     = n15.filter(n => PRIMES.has(n));
  const snt_cnt = snt.length;

  const unitMap: Record<number, number[]> = {};
  for (const n of n15) {
    const u = n % 10;
    if (!unitMap[u]) unitMap[u] = [];
    unitMap[u].push(n);
  }
  const xx = Object.values(unitMap)
    .filter(g => g.length >= 2)
    .flat()
    .sort((a, b) => a - b);

  const ke  = computeKe(n15);
  const mod = computeMod(n15);
  const sum = n15.reduce((a, b) => a + b, 0);

  const n15Set = new Set(n15);
  let t1 = 0, g0 = 0, p1 = 0;
  for (const pn of prevN15) {
    if (n15Set.has(pn - 1)) t1++;
    if (n15Set.has(pn))     g0++;
    if (n15Set.has(pn + 1)) p1++;
  }

  return { dec0, dec1, dec2, dec3, dd, dbx, dbdd, sc, cam, snt, snt_cnt, xx, ke, mod, sum, t1, g0, p1 };
}

// ── main converter ────────────────────────────────────────────────────────────

function rowToL535Row(
  row:        L535Kq,
  prevN15:    number[],
  allRows:    L535Kq[],
  idx:        number,
  qhKy:       number,
  levelCache: string[],
  clCache:    string[],
): L535Row {
  const n15 = getN15(row);
  const n6  = parseNum(row.n6);
  const stats      = computeStats(n15, n6, prevN15);
  const level      = computeLevel(n15);
  const cl5        = compute5CL(n15);
  const jpp        = computeJPP(n15, allRows, idx);
  const qhl        = computeQHL(allRows, idx, qhKy);
  const qhlSet     = new Set(qhl);
  const qh_hit     = n15.filter(n => qhlSet.has(n)).sort((a, b) => a - b);
  const qhc        = qhl.length;
  const jpck       = computeJPCK(allRows, idx);
  const jpmatch    = computeJPMatch(n15, allRows, idx);
  const level_cnt  = computePatternCnt(level, levelCache, idx);
  const cl5_cnt    = computePatternCnt(cl5,   clCache,    idx);

  return {
    thu:  row.thu?.trim()  ?? '',
    ngay: String(row.ngay  ?? ''),
    dot:  row.dot?.trim()  ?? '',
    ky:   row.ky?.trim()   ?? '',
    n1: n15[0], n2: n15[1], n3: n15[2], n4: n15[3], n5: n15[4], n6,
    dd_cnt: row.dd_cnt ?? 0, dd_amt: row.dd_amt ?? 0,
    g1_cnt: row.g1_cnt ?? 0, g1_amt: row.g1_amt ?? 0,
    g2_cnt: row.g2_cnt ?? 0, g2_amt: row.g2_amt ?? 0,
    g3_cnt: row.g3_cnt ?? 0, g3_amt: row.g3_amt ?? 0,
    g4_cnt: row.g4_cnt ?? 0, g4_amt: row.g4_amt ?? 0,
    g5_cnt: row.g5_cnt ?? 0, g5_amt: row.g5_amt ?? 0,
    kk_cnt: row.kk_cnt ?? 0, kk_amt: row.kk_amt ?? 0,
    n15,
    ...stats,
    level, level_cnt,
    cl5,   cl5_cnt,
    jpp,
    qh_hit, qhl, qhc,
    jpck,
    jpm_info: jpmatch.info,
    jpm_cnt:  jpmatch.cnt,
    isNo:  (row.dd_cnt ?? 0) > 0,
    isChi: (row.g1_amt ?? 0) > 10_000_000 || (row.g2_amt ?? 0) > 5_000_000,
  };
}

// ── public fetch ──────────────────────────────────────────────────────────────

export async function fetchL535List(params: {
  tu_ky?:  string;
  den_ky?: string;
  limit?:  number;
  qh_ky?:  number;
}): Promise<L535Row[]> {
  const { tu_ky, den_ky, limit = 20, qh_ky = 20 } = params;

  const allRows = await sql<L535Kq[]>`
    SELECT * FROM public.l535kq ORDER BY ky DESC
  `;

  let displayRows: L535Kq[];
  if (tu_ky && den_ky) {
    const from = tu_ky.padStart(5, '0');
    const to   = den_ky.padStart(5, '0');
    displayRows = allRows.filter(r => {
      const k = r.ky?.trim() ?? '';
      return k >= from && k <= to;
    });
  } else {
    displayRows = allRows.slice(0, limit);
  }

  const levelCache = allRows.map(r => computeLevel(getN15(r)));
  const clCache    = allRows.map(r => compute5CL(getN15(r)));

  const result: L535Row[] = [];
  for (let i = 0; i < displayRows.length; i++) {
    const globalIdx = allRows.findIndex(
      r => r.ky?.trim() === displayRows[i].ky?.trim()
    );
    const prevRow = allRows[globalIdx + 1];
    const prevN15 = prevRow ? getN15(prevRow) : [];
    result.push(
      rowToL535Row(displayRows[i], prevN15, allRows, globalIdx, qh_ky, levelCache, clCache)
    );
  }
  return result;
}
