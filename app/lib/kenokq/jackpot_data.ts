import sql from '@/app/lib/db';

function parseBacString(s: string | null): Record<string, number> {
  const result: Record<string, number> = {};
  if (!s) return result;
  for (const part of s.trim().split(',')) {
    const [yy, zz] = part.trim().split('-');
    if (yy && zz) result[`T${yy.padStart(2, '0')}`] = parseInt(zz);
  }
  return result;
}

export type JackpotRow = {
  ngay: string;
  gio: string;
  ky: string;
  bac_trung: number[];
  jackpot_green: boolean;
  jackpot_red: boolean;
};

export async function fetchJackpotList(params: {
  tu_ngay?: string;
  den_ngay?: string;
  limit?: number;
}): Promise<JackpotRow[]> {
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

  const result: JackpotRow[] = [];

  for (const row of rows) {
    const bac_trung: number[] = [];
    let green = false;
    let red = false;

    for (let i = 5; i <= 10; i++) {
      const col = `b${String(i).padStart(2, '0')}`;
      const bacData = parseBacString(row[col]);
      const key = `T${String(i).padStart(2, '0')}`;
      if ((bacData[key] ?? 0) > 0) {
        bac_trung.push(i);
        if (i <= 7) green = true;
        else red = true;
      }
    }

    if (bac_trung.length > 0) {
      result.push({
        ngay: row.ngay,
        gio: row.gio?.trim() ?? '',
        ky: row.ky?.trim() ?? '',
        bac_trung,
        jackpot_green: green,
        jackpot_red: red,
      });
    }
  }

  return result;
}
