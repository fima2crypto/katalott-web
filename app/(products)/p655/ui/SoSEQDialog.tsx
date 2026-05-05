"use client";

import { useState } from "react";
import { P655Row } from "@/app/lib/p655/definitions";

const DEC_COLORS: Record<number, string> = {
  0: "bg-red-400 text-white",    1: "bg-orange-400 text-white",
  2: "bg-yellow-400 text-black", 3: "bg-green-500 text-white",
  4: "bg-blue-500 text-white",   5: "bg-purple-500 text-white",
};

function numBg(n: number): string {
  return DEC_COLORS[Math.floor(n / 10)] ?? "bg-gray-200 text-black";
}

interface SeqEntry {
  lech: number;
  nums: number[];
}

function computeSoSEQ(rows: P655Row[]): SeqEntry[] {
  // rows sorted DESC, quet den khi du 55 so (full ky)
  const found = new Map<number, number>();

  for (let i = 0; i < rows.length; i++) {
    for (const n of rows[i].n16) {
      if (!found.has(n)) found.set(n, i);
    }
    if (found.size === 55) break;
  }

  // Nhom theo lech, sort tang dan
  const groups = new Map<number, number[]>();
  for (const [num, lech] of found.entries()) {
    if (!groups.has(lech)) groups.set(lech, []);
    groups.get(lech)!.push(num);
  }
  for (const arr of groups.values()) arr.sort((a, b) => a - b);

  return Array.from(groups.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([lech, nums]) => ({ lech, nums }));
}

async function fetchFullData(): Promise<P655Row[]> {
  const res = await fetch(`/api/p655/list`);
  if (!res.ok) throw new Error("Fetch failed");
  return res.json();
}

export default function SoSEQDialog({ qhKy = 20 }: { qhKy?: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<SeqEntry[]>([]);
  const [error, setError] = useState("");
  const [totalKy, setTotalKy] = useState(0);

  async function handleOpen() {
    setLoading(true);
    setError("");
    setOpen(true);
    try {
      const rows = await fetchFullData();
      setEntries(computeSoSEQ(rows));
      setTotalKy(rows.length);
    } catch {
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger: chi co nut, khong co input */}
      <button
        onClick={handleOpen}
        className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium transition-colors"
      >
        🔢 SoSEQ
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl flex flex-col max-h-[85vh] w-auto min-w-[220px] max-w-[95vw]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-sm font-bold text-purple-800">
                🔢 SoSEQ — quét full {totalKy > 0 ? `${totalKy} kỳ` : ""}
              </h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-4">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {loading && <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Đang tải...</div>}
              {error && <div className="text-red-500 text-sm p-4">{error}</div>}
              {!loading && !error && (
                <table className="border-collapse text-xs w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1 text-center font-semibold border border-gray-300 bg-gray-200">Lệch</th>
                      <th className="px-2 py-1 text-center font-semibold border border-gray-300 bg-gray-200">Số</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(({ lech, nums }) => (
                      <tr key={lech} className={lech === 0 ? "bg-yellow-50" : "hover:bg-gray-50"}>
                        <td className={`px-2 py-0.5 text-center text-xs font-bold border border-gray-200
                          ${lech === 0 ? "text-red-600" : lech > qhKy ? "text-orange-600" : "text-gray-700"}`}>
                          {lech}
                        </td>
                        <td className="px-1 py-0.5 border border-gray-200">
                          <div className="flex flex-wrap gap-0.5 min-w-[80px]">
                            {nums.map(n => (
                              <span key={n} className={`w-6 h-5 inline-flex items-center justify-center text-xs rounded font-bold ${numBg(n)}`}>
                                {String(n).padStart(2, "0")}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}