import sql from '@/app/lib/db';
import { M3DPKq, M3DPKqRow } from '@/app/lib/m3dp/definitions';

// ==================== CONSTANTS ====================
// So nguyen to 3 chu so (001-999)
function isPrime3(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}
const PRIMES_3D = new Set<number>();
for (let i = 1; i <= 999; i++) {
  if (isPrime3(i)) PRIMES_3D.add(i);
}

// ==================== HELPERS ====================
function parseGroup(s: string | null): string[] {
  if (!s) return [];
  return s.trim().split(/\s+/).filter(Boolean);
}

function digits(s: string): [number, number, number] {
  const padded = s.padStart(3, '0');
  return [parseInt(padded[0]), parseInt(padded[1]), parseInt(padded[2])];
}

function sumDigits(s: string): number {
  const [x, y, z] = digits(s);
  return x + y + z;
}

function isOddEven(s: string): string {
  const n = parseInt(s);
  return n % 2 === 0 ? 'C' : 'L';
}

// XX: so co 2-3 ky tu trung nhau
function isXX(s: string): boolean {
  const [x, y, z] = digits(s);
  return x === y || y === z || x === z;
}

// SA3: 3 chu so khi sap xep lai thi lien tiep nhau (vd 798->789, 564->456, 190->019)
function isSA3(s: string): boolean {
  const d = digits(s).slice().sort((a, b) => a - b);
  return d[1] === d[0] + 1 && d[2] === d[1] + 1;
}

// FIB: tong 2 trong 3 ky tu = ky tu con lai
function isFIB(s: string): boolean {
  const [x, y, z] = digits(s);
  return x + y === z || x + z === y || y + z === x;
}

// TDB: dem so ky tu so trung giua DB1 va DB2
function countTDB(db1: string, db2: string): number {
  const d1 = new Set(db1.padStart(3, '0').split(''));
  let count = 0;
  for (const c of db2.padStart(3, '0').split('')) {
    if (d1.has(c)) count++;
  }
  return count;
}

// ==================== COMPUTE ====================
function computeM3DPRow(row: M3DPKq, prevN20: string[]): M3DPKqRow {
  const db = parseGroup(row.db);   // 2 so
  const g1 = parseGroup(row.g1);   // 4 so
  const g2 = parseGroup(row.g2);   // 6 so
  const g3 = parseGroup(row.g3);   // 8 so
  const n20 = [...db, ...g1, ...g2, ...g3]; // 20 so

  const db1 = db[0] ?? '000';
  const db2 = db[1] ?? '000';

  // SUM
  const sum_db1 = sumDigits(db1);
  const sum_db2 = sumDigits(db2);

  // DBX, DBY, DBZ: cap ky tu theo vi tri
  const [db1x, db1y, db1z] = digits(db1);
  const [db2x, db2y, db2z] = digits(db2);
  const dbx = `${db1x}-${db2x}`;
  const dby = `${db1y}-${db2y}`;
  const dbz = `${db1z}-${db2z}`;

  // DD: gop 2 ky tu Chan/Le cua DB1+DB2, vd "LC"
  const dd = isOddEven(db1) + isOddEven(db2);

  // X0-X9 (hang tram)
  const x = Array(10).fill(0);
  for (const s of n20) x[digits(s)[0]]++;
  const xoff = [0,1,2,3,4,5,6,7,8,9].filter(i => x[i] === 0).join(',');

  // Y0-Y9 (hang chuc)
  const y = Array(10).fill(0);
  for (const s of n20) y[digits(s)[1]]++;
  const yoff = [0,1,2,3,4,5,6,7,8,9].filter(i => y[i] === 0).join(',');

  // Z0-Z9 (hang don vi)
  const z = Array(10).fill(0);
  for (const s of n20) z[digits(s)[2]]++;
  const zoff = [0,1,2,3,4,5,6,7,8,9].filter(i => z[i] === 0).join(',');

  // SNT
  const snt = n20.filter(s => PRIMES_3D.has(parseInt(s)));
  const snt_count = snt.length;

  // XX
  const xx = n20.filter(s => isXX(s));
  const xx_count = xx.length;

  // TDB
  const tdb_count = countTDB(db1, db2);
  const tdb_list = tdb_count > 0 ? `${db1}-${db2}` : '';

  // SA3
  const sa3 = n20.filter(s => isSA3(s));
  const sa3_count = sa3.length;

  // FIB
  const fib = n20.filter(s => isFIB(s));
  const fib_count = fib.length;

  // G0: cac so trong n20 cua ky nay co xuat hien trong prevN20
  const prevSet = new Set(prevN20);
  const g0 = n20.filter(s => prevSet.has(s));
  const g0_count = g0.length;

  return {
    thu: row.thu?.trim() ?? '',
    ngay: String(row.ngay),
    ky: row.ky?.trim() ?? '',
    db, g1, g2, g3, n20,
    sum_db1, sum_db2,
    dbx, dby, dbz,
    dd,
    x, xoff,
    y, yoff,
    z, zoff,
    snt, snt_count,
    xx, xx_count,
    tdb_list, tdb_count,
    sa3, sa3_count,
    fib, fib_count,
    g0, g0_count,
    db_cnt: row.db_cnt ?? 0,
    gp_cnt: row.gp_cnt ?? 0,
  };
}

// ==================== FETCH ====================
export async function fetchM3DPKqList(params: {
  tu_ky?: string;
  den_ky?: string;
  limit?: number;
}): Promise<M3DPKqRow[]> {
  const { tu_ky, den_ky, limit = 20 } = params;

  let rows: M3DPKq[];

  if (tu_ky && den_ky) {
    rows = await sql<M3DPKq[]>`
      SELECT * FROM public.m3dpkq
      WHERE ky BETWEEN ${tu_ky} AND ${den_ky}
      ORDER BY ky DESC
    `;
  } else {
    rows = await sql<M3DPKq[]>`
      SELECT * FROM public.m3dpkq
      ORDER BY ky DESC
      LIMIT ${limit}
    `;
  }

  // Compute stats, G0 dua vao cac ky truoc trong danh sach
  const result: M3DPKqRow[] = [];
  for (let i = 0; i < rows.length; i++) {
    // prevN20 = tat ca so cua cac ky truoc no (index i+1 tro di, vi da sort DESC)
    const prevN20: string[] = [];
    for (let j = i + 1; j < rows.length; j++) {
      prevN20.push(...parseGroup(rows[j].db));
      prevN20.push(...parseGroup(rows[j].g1));
      prevN20.push(...parseGroup(rows[j].g2));
      prevN20.push(...parseGroup(rows[j].g3));
    }
    result.push(computeM3DPRow(rows[i], prevN20));
  }
  return result;
}
