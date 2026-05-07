export interface L535Kq {
  thu:   string | null;
  ngay:  string | null;
  dot:   string | null;
  ky:    string | null;
  n1: string | null; n2: string | null; n3: string | null;
  n4: string | null; n5: string | null; n6: string | null;
  dd_cnt:  number | null; dd_amt:  number | null;
  g1_cnt:  number | null; g1_amt:  number | null;
  g2_cnt:  number | null; g2_amt:  number | null;
  g3_cnt:  number | null; g3_amt:  number | null;
  g4_cnt:  number | null; g4_amt:  number | null;
  g5_cnt:  number | null; g5_amt:  number | null;
  kk_cnt:  number | null; kk_amt:  number | null;
}

export interface L535Row {
  // raw fields
  thu:  string;
  ngay: string;
  dot:  string;
  ky:   string;
  n1: number; n2: number; n3: number; n4: number; n5: number; n6: number;
  dd_cnt: number; dd_amt: number;
  g1_cnt: number; g1_amt: number;
  g2_cnt: number; g2_amt: number;
  g3_cnt: number; g3_amt: number;
  g4_cnt: number; g4_amt: number;
  g5_cnt: number; g5_amt: number;
  kk_cnt: number; kk_amt: number;

  // N15 = [n1..n5], N6 riêng
  n15: number[];

  // hàng chục
  dec0: number; dec1: number; dec2: number; dec3: number;

  // DD = (C/L N1)(C/L N5)
  dd: 'CC' | 'CL' | 'LC' | 'LL';

  // DB fields (theo N6)
  dbx:  'X' | 'Y' | 'Z';        // 1-4:X, 5-8:Y, 9-12:Z
  dbdd: 'C' | 'L';              // C/L của N6

  sc:  number;                  // số chẵn trong N15
  cam: string;                  // hàng chục vắng, VD "1,3"

  snt:     number[];            // số nguyên tố trong N15
  snt_cnt: number;

  xx:  number[];                // số trùng đuôi trong N15
  ke:  number;                  // số cặp kề trong N15

  t1: number; g0: number; p1: number;

  mod: string;                  // trùng hàng đơn vị, VD "12,43"
  sum: number;                  // tổng N15

  // Level & 5CL
  level:      string;           // chuỗi 4 ký tự dec0..dec3
  level_cnt:  number | null;    // khoảng cách kỳ cùng level gần nhất
  cl5:        string;           // chuỗi C/L của N15 (5 ký tự)
  cl5_cnt:    number | null;    // khoảng cách kỳ cùng 5CL gần nhất

  // JPP
  jpp: number | null;           // số kỳ tối thiểu để union ≥ N15

  // QH
  qh_hit: number[];             // số của kỳ này nằm trong QHL
  qhl:    number[];             // số 1-35 chưa ra trong qh_ky kỳ trước
  qhc:    number;               // = qhl.length

  // JPCK
  jpck: number;                 // số kỳ đến kỳ dd_cnt>0 gần nhất

  // JPMatch
  jpm_info: string;             // "535 (00805: 3-9-21-22-26-35)"
  jpm_cnt:  number;             // số lượng số trùng

  // flags
  isNo:  boolean;               // dd_cnt > 0
  isChi: boolean;               // g1_amt > 10tr || g2_amt > 5tr
}
