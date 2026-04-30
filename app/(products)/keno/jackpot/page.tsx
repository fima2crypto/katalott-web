"use client";

import GiaiDialog from "@/app/(products)/keno/ui/GiaiDialog";
import { useCallback, useEffect, useState } from "react";

const API_BASE = "http://localhost:8000";

function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = (dateStr || "").slice(0, 10);
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
}

function parseDate(ddmmyyyy) {
  if (!ddmmyyyy) return "";
  const parts = ddmmyyyy.split("/");
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return "";
}

function autoSlash(val) {
  let v = val.replace(/\D/g, "");
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5);
  return v.slice(0, 10);
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-2 py-1 text-center text-xs font-semibold border border-gray-300 whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "", onClick = undefined }) {
  return (
    <td
      onClick={onClick}
      className={`px-2 py-1 text-center text-xs border border-gray-200 ${className}`}
    >
      {children}
    </td>
  );
}

function BacBadge({ bac }) {
  const isRed = bac >= 8;
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded text-white text-xs font-bold mx-0.5 ${isRed ? "bg-red-500" : "bg-green-500"}`}
    >
      {bac}
    </span>
  );
}

function todayDDMMYYYY() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function DateInput({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <label className="text-sm text-gray-600 whitespace-nowrap">{label}</label>
      <input
        type="text"
        placeholder="dd/mm/yyyy"
        value={value}
        onChange={(e) => onChange(autoSlash(e.target.value))}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-28"
      />
    </div>
  );
}

// ==================== MAIN ====================
export default function JackpotPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedKy, setSelectedKy] = useState(null);

  // Chế độ tìm kiếm
  const [mode, setMode] = useState<"range" | "limit">("range");

  // Chế độ khoảng ngày
  const [tuNgayInput, setTuNgayInput] = useState(todayDDMMYYYY());
  const [denNgayInput, setDenNgayInput] = useState(todayDDMMYYYY());

  // Chế độ số kỳ
  const [limit, setLimit] = useState(200);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (mode === "range") {
        const tuNgay = parseDate(tuNgayInput);
        const denNgay = parseDate(denNgayInput);
        if (tuNgay) params.set("tu_ngay", tuNgay);
        if (denNgay) params.set("den_ngay", denNgay);
      } else {
        params.set("limit", String(limit));
      }
      const res = await fetch(`${API_BASE}/keno/jackpot?${params}`);
      if (!res.ok) throw new Error(`Lỗi ${res.status}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [mode, tuNgayInput, denNgayInput, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gray-50 font-mono">
      {selectedKy && (
        <GiaiDialog ky={selectedKy} onClose={() => setSelectedKy(null)} />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 flex-wrap">
        <h1 className="text-lg font-bold text-blue-800">🎯 Jackpot</h1>

        {/* Mode switch */}
        <div className="flex items-center gap-1 border border-gray-300 rounded overflow-hidden text-xs">
          <button
            onClick={() => setMode("range")}
            className={`px-3 py-1.5 ${mode === "range" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            Khoảng ngày
          </button>
          <button
            onClick={() => setMode("limit")}
            className={`px-3 py-1.5 ${mode === "limit" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            Số kỳ
          </button>
        </div>

        {/* Mode: khoảng ngày */}
        {mode === "range" && (
          <div className="flex items-center gap-2">
            <DateInput
              label="Từ:"
              value={tuNgayInput}
              onChange={setTuNgayInput}
            />
            <DateInput
              label="Đến:"
              value={denNgayInput}
              onChange={setDenNgayInput}
            />
            {(tuNgayInput || denNgayInput) && (
              <button
                onClick={() => {
                  setTuNgayInput("");
                  setDenNgayInput("");
                }}
                className="text-xs text-red-500 hover:underline"
              >
                ✕ Xoá
              </button>
            )}
          </div>
        )}

        {/* Mode: số kỳ */}
        {mode === "limit" && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Số kỳ quét:</label>
            <input
              type="number"
              min={1}
              max={2000}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
            />
          </div>
        )}

        <div className="text-sm text-gray-500">
          Tổng: <strong>{data.length}</strong> kỳ
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-green-500 inline-block"></span>{" "}
            B05-B07
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-red-500 inline-block"></span>{" "}
            B08-B10
          </span>
        </div>
      </div>

      {error && (
        <div className="m-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="overflow-auto p-4">
        <table className="border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr>
              <Th className="bg-gray-100">STT</Th>
              <Th className="bg-gray-100">Ngày Giờ</Th>
              <Th className="bg-gray-100">Kỳ</Th>
              <Th className="bg-gray-100">Bậc Trúng</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">
                  ⏳ Đang tải...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row.ky} className="hover:bg-blue-50 transition-colors">
                  <Td className="bg-gray-50 text-gray-500">{idx + 1}</Td>
                  <Td className="whitespace-nowrap">
                    {fmtDate(row.ngay)} {row.gio}
                  </Td>
                  <Td
                    className={`font-mono font-bold cursor-pointer hover:underline
                      ${row.jackpot_red ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}
                    onClick={() => setSelectedKy(row.ky)}
                  >
                    {row.ky}
                  </Td>
                  <Td>
                    <div className="flex items-center justify-center flex-wrap gap-0.5">
                      {row.bac_trung.map((bac) => (
                        <BacBadge key={bac} bac={bac} />
                      ))}
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
