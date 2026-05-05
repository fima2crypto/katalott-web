import sql from '@/app/lib/db';

const PRIMES = new Set([
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79,
]);

function parseBacString(s: string | null): Record<string, number> {
  const result: Record<string, number> = {};
  if (!s) return result;
  for (const part of s.trim().split(',')) {
    const [yy, zz] = part.trim().split('-');
    if (yy && zz) result[`T${yy.padStart(2, '0')}`] = parseInt(zz);
  }
  return result;
}

function checkJackpot(row: any): { jackpot_green: boolean; jackpot_red: boolean } {
  let green = false;
  let red = false;
  for (let i = 5; i <= 10; i++) {
    const col = `b${String(i).padStart(2, '0')}`;
    const bacData = parseBacString(row[col]);
    const key = `T${String(i).padStart(2, '0')}`;
    if ((bacData[key] ?? 0) > 0) {
      if (i <= 7) green = true;
      else red = true;
    }
  }
  return { jackpot_green: green, jackpot_red: red };
}

export async function fetchSntData(params: {
  tu_ngay?: string;
  den_ngay?: string;
  limit?: number;
}) {
  const { tu_ngay, den_ngay, limit = 200 } = params;

  let rows: any[];

  if (tu_ngay && den_ngay) {
    rows = await sql`
      SELECT * FROM public.kenokq
      WHERE ngay BETWEEN ${tu_ngay} AND ${den_ngay}
      ORDER BY ky DESC
    `;
  } else if (tu_ngay) {
    rows = await sql`
      SELECT * FROM public.kenokq
      WHERE ngay >= ${tu_ngay}
      ORDER BY ky DESC
    `;
  } else if (den_ngay) {
    rows = await sql`
      SELECT * FROM public.kenokq
      WHERE ngay <= ${den_ngay}
      ORDER BY ky DESC
    `;
  } else {
    rows = await sql`
      SELECT * FROM public.kenokq
      ORDER BY ky DESC
      LIMIT ${limit}
    `;
  }

  const total_ky = rows.length;

  // Lay ky moi nhat toan DB
  const latestRow = await sql<{ ky: string }[]>`
    SELECT ky FROM public.kenokq ORDER BY ky DESC LIMIT 1
  `;
  const latest_ky = latestRow[0] ? parseInt(latestRow[0].ky.trim()) : 0;

  // Tinh bac_cnt va data
  const bac_cnt: Record<number, number> = {};
  const allResult: any[] = [];

  // Track prev_idx cho cach_ky
  const prev_idx: Record<number, number> = {};

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const n20 = (row.n20 || '').trim().split(/\s+/).map(Number).filter(Boolean);
    const snt = n20.filter(n => PRIMES.has(n)).sort((a, b) => a - b);
    const cnt = snt.length;
    const ky_int = parseInt(row.ky.trim());
    const jp = checkJackpot(row);

    if (cnt >= 2) {
      bac_cnt[cnt] = (bac_cnt[cnt] || 0) + 1;
    }

    // Tinh cach_ky
    let cach_ky: number | null = null;
    if (cnt >= 2) {
      if (prev_idx[cnt] !== undefined) {
        cach_ky = i - prev_idx[cnt] - 1;
      }
      prev_idx[cnt] = i;
    }

    allResult.push({
      ngay: row.ngay,
      gio: row.gio?.trim() ?? '',
      ky: row.ky?.trim() ?? '',
      snt,
      snt_str: snt.map(n => String(n).padStart(2, '0')).join('-'),
      cnt,
      cach_ky: latest_ky - ky_int,
      jackpot_green: jp.jackpot_green,
      jackpot_red: jp.jackpot_red,
    });
  }

  // Chi lay cnt >= 2
  const data = allResult.filter(r => r.cnt >= 2);

  // Build to_hop: key = snt_str, value = {cnt, last_ky}
  const toHopMap: Record<string, { cnt: number; last_ky: number }> = {};
  for (const r of allResult) {
    if (r.cnt < 2) continue;
    const key = r.snt_str;
    const ky_int = parseInt(r.ky);
    if (!toHopMap[key]) {
      toHopMap[key] = { cnt: 0, last_ky: ky_int };
    }
    toHopMap[key].cnt += 1;
    if (ky_int > toHopMap[key].last_ky) {
      toHopMap[key].last_ky = ky_int;
    }
  }

  const to_hop = Object.entries(toHopMap).map(([snt_str, val]) => ({
    snt_str,
    cnt: val.cnt,
    cach_ky: latest_ky - val.last_ky,
  })).sort((a, b) => b.cnt - a.cnt);

  return {
    total_ky,
    bac_cnt: Object.entries(bac_cnt)
      .map(([bac, cnt]) => ({ bac: parseInt(bac), cnt }))
      .sort((a, b) => a.bac - b.bac),
    data,
    to_hop,
  };
}