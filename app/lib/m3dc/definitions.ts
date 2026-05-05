// ==================== RAW DB ROW ====================
export interface M3DCKq {
  thu: string | null;
  ngay: Date | string | null;
  ky: string | null;
  db: string | null;   // "XXX YYY" (2 so, 3 ky tu moi so, cach nhau space)
  g1: string | null;   // "XXX YYY ZZZ AAA" (4 so)
  g2: string | null;   // 6 so
  g3: string | null;   // 8 so
  db_cnt: number | null;
  db_amt: number | null;
  g1_cnt: number | null;
  g1_amt: number | null;
  g2_cnt: number | null;
  g2_amt: number | null;
  g3_cnt: number | null;
  g3_amt: number | null;
  g4_cnt: number | null;
  g4_amt: number | null;
  g5_cnt: number | null;
  g5_amt: number | null;
  g6_cnt: number | null;
  g6_amt: number | null;
}

// ==================== COMPUTED ROW ====================
export interface M3DCKqRow {
  thu: string;
  ngay: string;
  ky: string;

  // Tach DB, G1, G2, G3 thanh mang so (string "001"-"999")
  db: string[];   // 2 phan tu
  g1: string[];   // 4 phan tu
  g2: string[];   // 6 phan tu
  g3: string[];   // 8 phan tu
  n20: string[];  // Toan bo 20 so (db+g1+g2+g3)

  // SUM: tong 3 chu so cua DB1, DB2
  sum_db1: number;
  sum_db2: number;

  // DBX, DBY, DBZ: cap ky tu X/Y/Z cua DB1-DB2
  dbx: string; // vi du "3-5"
  dby: string;
  dbz: string;

  // DD: Chan/Le cua DB1+DB2 gop lai, vd "LC", "CC"
  dd: string;

  // X0-X9: dem trong N20 co bao nhieu so co hang tram = X
  x: number[]; // x[0..9]
  xoff: string; // cac X vang mat, phan cach boi ","

  // Y0-Y9: dem trong N20 co bao nhieu so co hang chuc = Y
  y: number[]; // y[0..9]
  yoff: string;

  // Z0-Z9: dem trong N20 co bao nhieu so co hang don vi = Z
  z: number[]; // z[0..9]
  zoff: string;

  // SNT: so nguyen to trong N20
  snt: string[];
  snt_count: number;

  // XX: so co 2-3 ky tu trung nhau (vd 353, 444, 188)
  xx: string[];
  xx_count: number;

  // TDB: 2 so DB1, DB2 co ky tu so trung nhau
  tdb_list: string; // "DB1-DB2" neu co trung, roi ""
  tdb_count: number; // so ky tu so trung

  // SA3: so tien theo thu tu ke nhau (vd 243, 342, 190)
  sa3: string[];
  sa3_count: number;

  // FIB: tong 2 ky tu = ky tu con lai (vd 347, 473, 121)
  fib: string[];
  fib_count: number;

  // G0: cac so thuoc N20 cua ky hien tai, xuat hien trong cac ky truoc (trong danh sach hien thi)
  g0: string[];
  g0_count: number;

  // Giai thuong
  db_cnt: number;
}
