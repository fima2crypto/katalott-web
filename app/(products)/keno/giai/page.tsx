"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

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

// ==================== HELPERS ====================
function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = (dateStr || "").slice(0, 10);
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
}

function fmtMoney(val: number) {
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

function Td({ children, className = "" }) {
  return (
    <td
      className={`px-1 py-0.5 text-center text-xs border border-gray-200 ${className}`}
    >
      {children}
    </td>
  );
}

function ZZCell({ ky, bac, trung, zz }) {
  const bacNum = parseInt(bac.slice(1));
  const trungNum = parseInt(trung.slice(1));
  const isMatch = bacNum === trungNum;

  let bg = "";
  if (isMatch) {
    bg = bac === "b05" ? "bg-orange-400" : "bg-yellow-300";
  }

  return <Td className={bg}>{zz > 0 ? zz : ""}</Td>;
}

function BttRow({ ky_data }) {
  return (
    <tr className="bg-green-400 font-bold text-xs">
      <Td className="whitespace-nowrap bg-green-400">
        {fmtDate(ky_data.ngay)} {ky_data.gio}
      </Td>
      <Td className="bg-green-400 text-blue-800">{ky_data.ky}</Td>
      <Td className="bg-green-400">{fmtMoney(ky_data.btt_tong)}</Td>
      {BACS.map((bac) => (
        <Td key={bac} className="bg-green-400">
          {fmtMoney(ky_data.bacs[bac]?.btt)}
        </Td>
      ))}
    </tr>
  );
}

function TrungRows({ ky_data }) {
  return TRUNGS.map((trung) => {
    const hasData = BACS.some(
      (bac) => (ky_data.bacs[bac]?.trungs?.[trung] ?? 0) > 0,
    );
    if (!hasData) return null;

    return (
      <tr key={`${ky_data.ky}-${trung}`} className="hover:bg-blue-50">
        <Td></Td>
        <Td></Td>
        <Td className="text-gray-500 text-xs">{trung}</Td>
        {BACS.map((bac) => {
          const zz = ky_data.bacs[bac]?.trungs?.[trung] ?? 0;
          return (
            <ZZCell
              key={`${ky_data.ky}-${trung}-${bac}`}
              ky={ky_data.ky}
              bac={bac}
              trung={trung}
              zz={zz}
            />
          );
        })}
      </tr>
    );
  });
}

// ==================== MAIN ====================
export default function GiaiPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const limit = Number(searchParams.get("limit") || 20);

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
      const res = await fetch(`${API_BASE}/keno/giai?${params}`);
      if (!res.ok) throw new Error(`Lỗi ${res.status}`);
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <h1 className="text-lg font-bold text-blue-800">🏆 Giải Thưởng Keno</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Số kỳ:</label>
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
          ⚠️ {error}
        </div>
      )}

      <div className="overflow-auto">
        <table
          className="border-collapse text-xs"
          style={{ minWidth: "max-content" }}
        >
          <thead className="sticky top-0 z-10">
            <tr>
              <Th className="bg-gray-100">Ngày</Th>
              <Th className="bg-gray-100">Kỳ</Th>
              <Th className="bg-gray-100">BTT</Th>
              {BAC_LABELS.map((label, i) => (
                <Th
                  key={label}
                  className={
                    BACS[i] === "b05" ? "bg-orange-300" : "bg-yellow-200"
                  }
                >
                  {label}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={100} className="text-center py-8 text-gray-400">
                  ⏳ Đang tải...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={100} className="text-center py-8 text-gray-400">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              data.map((ky_data) => (
                <React.Fragment key={ky_data.ky}>
                  <BttRow ky_data={ky_data} />
                  <TrungRows ky_data={ky_data} />
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
