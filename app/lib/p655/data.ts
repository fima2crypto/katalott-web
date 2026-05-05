import sql from '@/app/lib/db';
import { P655Kq, P655Row } from './definitions';

const PRIMES = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53]);
const ALL_NUMS = Array.from({ length: 55 }, (_, i) => i + 1);

function parseNum(s: string | null): number {
  if (!s) return 0;
  return parseInt(s.trim(), 10) || 0;
}
function isEven(n: number) { return n % 2 === 0; }

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

// JPP: tim X nho nhat sao cho union N16 X ky truoc chua du n16
function computeJPP(n16: number[], allRows: P655Kq[], idx: number): number | null {
  const target = new Set(n16);
  const union = new Set<number>();
  for (let j = idx + 1; j < allRows.length; j++) {
    [allRows[j].n1,allRows[j].n2,allRows[j].n3,
     allRows[j].n4,allRows[j].n5,allRows[j].n6].forEach(v => union.add(parseNum(v)));
    if ([...target].every(n => union.has(n))) return j - idx;
  }
  return null;
}

// QHL: so 1-55 chua ra trong qhKy ky truoc ky idx
function computeQHL(allRows: P655Kq[], idx: number, qhKy: number): number[] {
  const seen = new Set<number>();
  const end = Math.min(idx + qhKy, allRows.length - 1);
  for (let j = idx + 1; j <= end; j++)
    [allRows[j].n1,allRows[j].n2,allRows[j].n3,
     allRows[j].n4,allRows[j].n5,allRows[j].n6].forEach(v => seen.add(parseNum(v)));
  return ALL_NUMS.filter(n => !seen.has(n));
}

// JP1CK: so ky tu idx den ky co jp1_cnt>0 gan nhat
function computeJP1CK(allRows: P655Kq[], idx: number): number {
  for (let j = idx; j < allRows.length; j++)
    if ((allRows[j].jp1_cnt ?? 0) > 0) return j - idx;
  return allRows.length - idx;
}

// Level: chuoi 6 ky tu tu dec0..dec5
function computeLevel(n16: number[]): string {
  const decs = [0,1,2,3,4,5].map(d => n16.filter(n => Math.floor(n/10) === d).length);
  return decs.join('');
}

// 6CL: chuoi C/L cua N1->N6 theo thu tu
function compute6CL(n16: number[]): string {
  return n16.map(n => isEven(n) ? 'C' : 'L').join('');
}

// Tim ky gan nhat (j > idx) co cung level/6cl, tra ve so ky cach nhau
function computePatternCnt(val: string, precomputed: string[], idx: number): number | null {
  for (let j = idx + 1; j < precomputed.length; j++) {
    if (precomputed[j] === val) return j - idx;
  }
  return null;
}

// JPMatch: tim ky truoc co nhieu so trung nhat voi n16
function computeJPMatch(n16: number[], allRows: P655Kq[], idx: number): {
  info: string; cnt: number;
} {
  const target = new Set(n16);
  let bestCnt = 0;
  let bestJ = -1;

  for (let j = idx + 1; j < allRows.length; j++) {
    const r = allRows[j];
    const rNums = [parseNum(r.n1),parseNum(r.n2),parseNum(r.n3),
                   parseNum(r.n4),parseNum(r.n5),parseNum(r.n6)];
    const cnt = rNums.filter(n => target.has(n)).length;
    if (cnt > bestCnt) {
      bestCnt = cnt;
      bestJ = j;
    }
  }

  if (bestJ === -1 || bestCnt === 0) return { info: '', cnt: 0 };

  const r = allRows[bestJ];
  const ky = r.ky?.trim() ?? '';
  const nums = [parseNum(r.n1),parseNum(r.n2),parseNum(r.n3),
                parseNum(r.n4),parseNum(r.n5),parseNum(r.n6)];
  const lech = bestJ - idx;
  const info = `${lech} (${ky}: ${nums.join('-')})`;
  return { info, cnt: bestCnt };
}

function computeStats(n16: number[], prevN16: number[]) {
  const dec0=n16.filter(n=>Math.floor(n/10)===0).length;
  const dec1=n16.filter(n=>Math.floor(n/10)===1).length;
  const dec2=n16.filter(n=>Math.floor(n/10)===2).length;
  const dec3=n16.filter(n=>Math.floor(n/10)===3).length;
  const dec4=n16.filter(n=>Math.floor(n/10)===4).length;
  const dec5=n16.filter(n=>Math.floor(n/10)===5).length;
  const dd: P655Row['dd'] = isEven(n16[0]) ? (isEven(n16[5]) ? 'CC':'CL') : (isEven(n16[5]) ? 'LC':'LL');
  const sc = n16.filter(n => isEven(n)).length;
  const presentDecs = new Set(n16.map(n => Math.floor(n/10)));
  const cam = [0,1,2,3,4,5].filter(d => !presentDecs.has(d)).join(',');
  const snt = n16.filter(n => PRIMES.has(n));
  const snt_cnt = snt.length;
  const xx = n16.filter(n => new Set([11,22,33,44,55]).has(n));
  const ke = computeKe(n16);
  const n16Set = new Set(n16);
  let t1=0, g0=0, p1=0;
  for (const pn of prevN16) {
    if (n16Set.has(pn-1)) t1++;
    if (n16Set.has(pn))   g0++;
    if (n16Set.has(pn+1)) p1++;
  }
  const mod = computeMod(n16);
  const sum = n16.reduce((a,b) => a+b, 0);
  return { dec0,dec1,dec2,dec3,dec4,dec5, dd, sc, cam, snt, snt_cnt, xx, ke, t1, g0, p1, mod, sum };
}

function rowToP655Row(
  row: P655Kq, prevN16: number[], allRows: P655Kq[], idx: number, qhKy: number,
  levelCache: string[], clCache: string[]
): P655Row {
  const n1=parseNum(row.n1), n2=parseNum(row.n2), n3=parseNum(row.n3);
  const n4=parseNum(row.n4), n5=parseNum(row.n5), n6=parseNum(row.n6);
  const n7=parseNum(row.n7);
  const n16 = [n1,n2,n3,n4,n5,n6];

  const stats = computeStats(n16, prevN16);
  const jpp = computeJPP(n16, allRows, idx);

  const qhl = computeQHL(allRows, idx, qhKy);
  const qhlSet = new Set(qhl);
  const qh_hit = n16.filter(n => qhlSet.has(n)).sort((a,b) => a-b);
  const qhc = qhl.length;
  const jp1ck = computeJP1CK(allRows, idx);

  const level = computeLevel(n16);
  const level_cnt = computePatternCnt(level, levelCache, idx);
  const cl6 = compute6CL(n16);
  const cl6_cnt = computePatternCnt(cl6, clCache, idx);

  const jpmatch = computeJPMatch(n16, allRows, idx);

  return {
    thu: row.thu?.trim() ?? '', ngay: String(row.ngay ?? ''), ky: row.ky?.trim() ?? '',
    n1,n2,n3,n4,n5,n6,n7,
    jp1_cnt: row.jp1_cnt ?? 0, jp2_cnt: row.jp2_cnt ?? 0,
    jp1_amt: row.jp1_amt ?? null, jp2_amt: row.jp2_amt ?? null,
    n16, ...stats, jpp, qh_hit, qhl, qhc, jp1ck,
    level, level_cnt,
    cl6, cl6_cnt,
    jpm_info: jpmatch.info, jpm_cnt: jpmatch.cnt,
  };
}

export async function fetchP655List(params: {
  tu_ngay?: string; den_ngay?: string;
  tu_ky?: string; den_ky?: string;
  limit?: number; qh_ky?: number;
}): Promise<P655Row[]> {
  const { tu_ngay, den_ngay, tu_ky, den_ky, limit = 20, qh_ky = 20 } = params;

  // Fetch FULL history (dung chung cho JPP, QHL, JPMatch, Level, 6CL)
  const allRows = await sql<P655Kq[]>`
    SELECT * FROM public.p655kq ORDER BY ky DESC
  `;

  // Xac dinh display range
  let displayRows: P655Kq[];
  if (tu_ky && den_ky) {
    const from = tu_ky.padStart(5,'0'), to = den_ky.padStart(5,'0');
    displayRows = allRows.filter(r => {
      const k = r.ky?.trim() ?? '';
      return k >= from && k <= to;
    });
  } else if (tu_ngay && den_ngay) {
    displayRows = allRows.filter(r => {
      const d = String(r.ngay ?? '').slice(0,10);
      return d >= tu_ngay && d <= den_ngay;
    });
  } else {
    displayRows = allRows.slice(0, limit);
  }

  // Pre-compute level & 6CL cache cho toan bo allRows
  const levelCache = allRows.map(r => {
    const nums = [parseNum(r.n1),parseNum(r.n2),parseNum(r.n3),
                  parseNum(r.n4),parseNum(r.n5),parseNum(r.n6)];
    return computeLevel(nums);
  });
  const clCache = allRows.map(r => {
    const nums = [parseNum(r.n1),parseNum(r.n2),parseNum(r.n3),
                  parseNum(r.n4),parseNum(r.n5),parseNum(r.n6)];
    return compute6CL(nums);
  });

  const result: P655Row[] = [];
  for (let i = 0; i < displayRows.length; i++) {
    // Tim idx cua displayRows[i] trong allRows
    const globalIdx = allRows.findIndex(r => r.ky?.trim() === displayRows[i].ky?.trim());
    const prevRow = allRows[globalIdx + 1];
    const prevN16 = prevRow
      ? [parseNum(prevRow.n1),parseNum(prevRow.n2),parseNum(prevRow.n3),
         parseNum(prevRow.n4),parseNum(prevRow.n5),parseNum(prevRow.n6)]
      : [];
    result.push(rowToP655Row(displayRows[i], prevN16, allRows, globalIdx, qh_ky, levelCache, clCache));
  }
  return result;
}
