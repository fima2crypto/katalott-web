/** Màu hàng chục (giống Keno) — dùng được cả client lẫn server */
export function tensColor(n: number): string {
  const t = Math.floor(n / 10);
  const colors: Record<number, string> = {
    0: "#e74c3c",
    1: "#3498db",
    2: "#2ecc71",
    3: "#f39c12",
  };
  return colors[t] ?? "#95a5a6";
}

export const DD_COLOR: Record<string, string> = {
  CC: "#f39c12", CL: "#f1c40f", LC: "#00bcd4", LL: "#2ecc71",
};

export const BG_COT  = "#fffde7";
export const BG_GRAY = "#e0e0e0";
export const BG_BROWN = "#a1887f";
