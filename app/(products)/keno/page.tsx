"use client";

import GiaiDialog from "@/app/(products)/keno/ui/GiaiDialog";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const API_BASE = "http://localhost:8000";

const BACS = [
  "b10",
  "b09",
  "b08",
  "b07",
  "b06",
  "b05",
  "b04",
  "b03",
  "b02",
  "b01",
];
const BAC_LABELS = [
  "B10",
  "B09",
  "B08",
  "B07",
  "B06",
  "B05",
  "B04",
  "B03",
  "B02",
  "B01",
];
const TRUNGS = [
  "T10",
  "T09",
  "T08",
  "T07",
  "T06",
  "T05",
  "T04",
  "T03",
  "T02",
  "T01",
  "T00",
];

// ==================== MÀU SẮC ====================
function getNumColor(n) {
  if (n === 0) return "";
  const dec = Math.floor(n / 10);
  const colors = [
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-400",
    "bg-cyan-400",
    "bg-blue-600",
    "bg-purple-400",
    "bg-lime-400",
    "bg-sky-400",
    "bg-red-400",
  ];
  return colors[dec] || "bg-gray-100";
}

function getNumBgStyle(n) {
  if (n === 80) return { backgroundColor: "#ef4444", color: "white" };
  return {};
}

function getCountColor(val) {
  if (val === 0) return "text-gray-300";
  return "text-black";
}

function getCellBg(val, highlight = false, bgHeader = "") {
  if (!highlight) return "";
  if (val === 0) return "bg-gray-200";
  if (val >= 5) return "bg-red-500";
  if (val >= 1) return bgHeader;
  return "";
}

function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = (dateStr || "").slice(0, 10);
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
}

function fmtMoney(val) {
  if (!val) return "";
  return val.toLocaleString("vi-VN");
}

// ==================== COMPONENTS ====================
function Th({ children, className = "", colSpan = undefined }) {
  return (
    <th
      colSpan={colSpan}
      className={`px-1 py-1 text-center text-xs font-semibold border border-gray-300 whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

// FIX: thêm onClick prop
function Td({ children, className = "", onClick = undefined }) {
  return (
    <td
      onClick={onClick}
      className={`px-1 py-0.5 text-center text-xs border border-gray-200 ${className}`}
    >
      {children}
    </td>
  );
}

function NumCell({ n }) {
  if (!n)
    return (
      <span className="w-6 h-6 inline-flex items-center justify-center text-xs text-gray-300">
        -
      </span>
    );
  const base =
    "w-6 h-6 inline-flex items-center justify-center text-xs rounded font-sans";
  return (
    <span className={`${base} ${getNumColor(n)}`} style={getNumBgStyle(n)}>
      {String(n).padStart(2, "0")}
    </span>
  );
}

// ==================== ROW ====================
function KenoRow({ row, idx, onKyClick }) {
  const nums = row.nums || [];

  return (
    <tr className="hover:bg-blue-50 transition-colors">
      <Td className="bg-gray-50 text-gray-500">{idx}</Td>
      <Td className="whitespace-nowrap">
        {fmtDate(row.ngay)} {row.gio}
      </Td>

      {/* Ky — click để mở dialog */}
      <Td
        className={`font-mono cursor-pointer hover:underline
          ${
            row.jackpot_red
              ? "bg-red-500 text-white"
              : row.jackpot_green
                ? "bg-green-500 text-white"
                : "text-blue-700 hover:text-blue-900"
          }`}
        onClick={() => onKyClick(row.ky)}
      >
        {row.ky}
      </Td>

      {nums.map((n, i) => (
        <Td key={i} className="p-0.5">
          <NumCell n={n} />
        </Td>
      ))}

      {/* G0 */}
      <Td>{row.g0_count > 0 ? row.g0.join(",") : ""}</Td>
      <Td
        className={`${row.g0_count >= 7 ? "bg-red-500 text-white" : row.g0_count >= 5 ? "bg-green-500 text-white" : "bg-yellow-50"} w-8 min-w-[2rem] text-center font-bold`}
      >
        {row.g0_count}
      </Td>

      {/* XX */}
      <Td>{row.xx_count > 0 ? row.xx.join(",") : ""}</Td>
      <Td
        className={`${row.xx_count >= 4 ? "bg-red-500 text-white" : row.xx_count === 0 ? "bg-gray-500" : "bg-yellow-50"} w-8 min-w-[2rem] text-center`}
      >
        {row.xx_count}
      </Td>

      {/* SNT */}
      <Td>{row.snt_count > 0 ? row.snt.join(",") : ""}</Td>
      <Td
        className={`${row.snt_count >= 7 ? "bg-red-500 text-white" : row.snt_count >= 5 ? "bg-green-500 text-white" : "bg-yellow-50"} w-8 min-w-[2rem] text-center font-bold`}
      >
        {row.snt_count}
      </Td>

      {/* HT0-HT7 */}
      {Array.from({ length: 8 }).map((_, i) => {
        const val = row[`ht${i}`] ?? 0;
        return (
          <Td key={`ht${i}`} className={getCellBg(val, true, "bg-cyan-100")}>
            <span className={getCountColor(val)}>{val}</span>
          </Td>
        );
      })}

      {/* VT */}
      {[1, 2, 3, 5, 7, 9].map((n) => {
        const val = row[`vt${n}`] ?? 0;
        return (
          <Td key={`vt${n}`} className={getCellBg(val, true, "bg-yellow-100")}>
            <span className={getCountColor(val)}>{val}</span>
          </Td>
        );
      })}

      {/* H0-H8 */}
      {Array.from({ length: 9 }).map((_, i) => {
        const val = row[`h${i}`] ?? 0;
        return (
          <Td key={`h${i}`} className={getCellBg(val, true, "bg-blue-100")}>
            <span className={getCountColor(val)}>{val}</span>
          </Td>
        );
      })}

      {/* V0-V9 */}
      {Array.from({ length: 10 }).map((_, i) => {
        const val = row[`v${i}`] ?? 0;
        return (
          <Td key={`v${i}`} className={getCellBg(val, true, "bg-green-100")}>
            <span className={getCountColor(val)}>{val}</span>
          </Td>
        );
      })}
    </tr>
  );
}

// ==================== MAIN COMPONENT ====================
export default function KenoTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedKy, setSelectedKy] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const limit = Number(searchParams.get("limit") || 12);

  function updateLimit(newLimit) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", String(newLimit));
    router.push(`?${params.toString()}`);
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit });
      const res = await fetch(`${API_BASE}/keno/last?${params}`);
      if (!res.ok) throw new Error(`Loi ${res.status}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gray-50 font-mono">
      {/* Dialog */}
      {selectedKy && (
        <GiaiDialog ky={selectedKy} onClose={() => setSelectedKy(null)} />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 flex-wrap">
        <h1 className="text-lg font-bold text-blue-800">📋 Kết quả</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm">So ky:</label>
          <input
            type="number"
            min={1}
            max={500}
            value={limit}
            onChange={(e) => updateLimit(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
          />
        </div>
      </div>

      {error && (
        <div className="m-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto">
        <table
          className="border-collapse text-xs"
          style={{ minWidth: "max-content" }}
        >
          <thead className="sticky top-0 z-10">
            <tr>
              <Th className="bg-gray-100">STT</Th>
              <Th className="bg-gray-100">Ngay</Th>
              <Th className="bg-gray-100">Ky</Th>
              {Array.from({ length: 20 }).map((_, i) => (
                <Th key={i} className="bg-blue-50">
                  N{i + 1}
                </Th>
              ))}
              <Th colSpan={2} className="bg-red-200">
                G0
              </Th>
              <Th colSpan={2} className="bg-blue-400">
                XX
              </Th>
              <Th colSpan={2} className="bg-green-200">
                SNT
              </Th>
              {Array.from({ length: 8 }).map((_, i) => (
                <Th key={i} className="bg-cyan-200">
                  HT{i}
                </Th>
              ))}
              {[1, 2, 3, 5, 7, 9].map((n) => (
                <Th key={n} className="bg-yellow-200">
                  VT{n}
                </Th>
              ))}
              {Array.from({ length: 9 }).map((_, i) => (
                <Th key={i} className="bg-blue-200">
                  H{i}
                </Th>
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <Th key={i} className="bg-green-200">
                  V{i}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={100} className="text-center py-8 text-gray-400">
                  Dang tai...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={100} className="text-center py-8 text-gray-400">
                  Khong co du lieu
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <KenoRow
                  key={row.ky || i}
                  idx={i + 1}
                  row={row}
                  onKyClick={setSelectedKy}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
