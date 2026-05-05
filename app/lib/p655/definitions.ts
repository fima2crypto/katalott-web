export interface P655Kq {
  thu: string | null; ngay: string | null; ky: string | null;
  n1: string | null; n2: string | null; n3: string | null;
  n4: string | null; n5: string | null; n6: string | null;
  n7: string | null;
  jp1_cnt: number | null; jp1_amt: number | null;
  jp2_cnt: number | null; jp2_amt: number | null;
  g1_cnt: number | null; g1_amt: number | null;
  g2_cnt: number | null; g2_amt: number | null;
  g3_cnt: number | null; g3_amt: number | null;
}

export interface P655Row {
  thu: string; ngay: string; ky: string;
  n1: number; n2: number; n3: number;
  n4: number; n5: number; n6: number; n7: number;
  jp1_cnt: number; jp2_cnt: number;
  jp1_amt: number | null; jp2_amt: number | null;
  n16: number[];
  dec0: number; dec1: number; dec2: number;
  dec3: number; dec4: number; dec5: number;
  dd: 'CC' | 'CL' | 'LC' | 'LL';
  sc: number; cam: string;
  snt: number[]; snt_cnt: number;
  xx: number[]; ke: number;
  t1: number; g0: number; p1: number;
  mod: string; sum: number;
  // Level & 6CL
  level: string;          // chuoi 6 ky tu dec0..dec5
  level_cnt: number | null; // ky gan nhat cung level
  cl6: string;            // chuoi C/L cua N1..N6
  cl6_cnt: number | null; // ky gan nhat cung 6CL
  // JPP
  jpp: number | null;
  // QH
  qh_hit: number[];
  qhl: number[];
  qhc: number;
  // JP1
  jp1ck: number;
  // JPMatch
  jpm_info: string;       // "535 (00805: 3-9-21-22-26-35)"
  jpm_cnt: number;        // so luong so trung
}
