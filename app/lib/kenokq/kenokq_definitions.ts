// ==================== KENOKQ ====================
export type KenoKq = {
  thu: string;
  ngay: string;
  gio: string;
  ky: string;
  n20: string;
  b10: string | null;
  b09: string | null;
  b08: string | null;
  b07: string | null;
  b06: string | null;
  b05: string | null;
  b04: string | null;
  b03: string | null;
  b02: string | null;
  b01: string | null;
};

export type KenoKqRow = {
  thu: string;
  ngay: string;
  gio: string;
  ky: string;
  nums: number[];
  // G0
  g0: number[];
  g0_count: number;
  // XX
  xx: number[];
  xx_count: number;
  // SNT
  snt: number[];
  snt_count: number;
  // HT0-HT7
  ht0: number; ht1: number; ht2: number; ht3: number;
  ht4: number; ht5: number; ht6: number; ht7: number;
  // VT1,2,3,5,7,9
  vt1: number; vt2: number; vt3: number;
  vt5: number; vt7: number; vt9: number;
  // H0-H8
  h0: number; h1: number; h2: number; h3: number;
  h4: number; h5: number; h6: number; h7: number; h8: number;
  // V0-V9
  v0: number; v1: number; v2: number; v3: number; v4: number;
  v5: number; v6: number; v7: number; v8: number; v9: number;
  // Jackpot
  jackpot_green: boolean;
  jackpot_red: boolean;
  bac_trung: number[];
};
