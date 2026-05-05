// ==================== KENOTRX ====================
export type KenoTrxStatus = 'buy' | 'done';

export type KenoTrx = {
  id: string;
  ngay: string;
  tu_ky: string;
  so_ky: number;
  so_chon_a: string | null;
  gia_a: number | null;
  so_chon_b: string | null;
  gia_b: number | null;
  so_chon_c: string | null;
  gia_c: number | null;
  so_chon_d: string | null;
  gia_d: number | null;
  so_chon_e: string | null;
  gia_e: number | null;
  so_chon_f: string | null;
  gia_f: number | null;
  status: KenoTrxStatus;
  last_update: string;
};

// Form khi tao moi / sua
export type KenoTrxForm = {
  id?: string;           // undefined khi tao moi
  tu_ky: string;
  so_ky: number;
  so_chon_a: string;
  gia_a: number;
  so_chon_b: string;
  gia_b: number;
  so_chon_c: string;
  gia_c: number;
  so_chon_d: string;
  gia_d: number;
  so_chon_e: string;
  gia_e: number;
  so_chon_f: string;
  gia_f: number;
  status: KenoTrxStatus;
};

// Ticket trong 1 ve
export type KenoTicket = {
  label: string;         // A, B, C, D, E, F
  so_chon: string;
  gia: number;
};

// ==================== KENOTRXKQ ====================
export type KenoTrxKq = {
  id: string;
  ngay: string;
  ky: string;
  ticket: string;
  so_chon: string | null;
  gia: number | null;
  so_trung: string | null;
  so_cnt: number | null;
  thuong: number | null;
};

// Ket qua tong hop theo id
export type KenoTrxKqSummary = {
  id: string;
  tong_thuong: number;
  tong_gia: number;
  details: KenoTrxKq[];
};
