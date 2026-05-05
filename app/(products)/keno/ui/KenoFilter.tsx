"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function autoSlash(val: string) {
  let v = val.replace(/\D/g, "");
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5);
  return v.slice(0, 10);
}

function parseDate(ddmmyyyy: string): string {
  if (!ddmmyyyy) return "";
  const parts = ddmmyyyy.split("/");
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return "";
}

function fmtDateDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

interface Props {
  mode: string;
  tuNgay: string;
  denNgay: string;
  limit: number;
}

export default function KenoFilter({ mode, tuNgay, denNgay, limit }: Props) {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState(mode || "limit");
  const [tuNgayInput, setTuNgayInput] = useState(fmtDateDisplay(tuNgay));
  const [denNgayInput, setDenNgayInput] = useState(fmtDateDisplay(denNgay));
  const [limitVal, setLimitVal] = useState(limit);

  function apply() {
    const params = new URLSearchParams();
    params.set("mode", currentMode);
    if (currentMode === "range") {
      const tu = parseDate(tuNgayInput);
      const den = parseDate(denNgayInput);
      if (tu) params.set("tu_ngay", tu);
      if (den) params.set("den_ngay", den);
    } else {
      params.set("limit", String(limitVal));
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Mode switch */}
      <div className="flex items-center gap-1 border border-gray-300 rounded overflow-hidden text-xs">
        <button
          onClick={() => setCurrentMode("limit")}
          className={`px-3 py-1.5 ${currentMode === "limit" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
        >
          Số kỳ
        </button>
        <button
          onClick={() => setCurrentMode("range")}
          className={`px-3 py-1.5 ${currentMode === "range" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
        >
          Khoảng ngày
        </button>
      </div>

      {/* Inputs */}
      {currentMode === "range" ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <label className="text-sm text-gray-600">Từ:</label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={tuNgayInput}
              onChange={(e) => setTuNgayInput(autoSlash(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-28"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-sm text-gray-600">Đến:</label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={denNgayInput}
              onChange={(e) => setDenNgayInput(autoSlash(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-28"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <label className="text-sm text-gray-600">Số kỳ:</label>
          <input
            type="number"
            min={1}
            max={500}
            value={limitVal}
            onChange={(e) => setLimitVal(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
          />
        </div>
      )}

      {/* Apply button */}
      <button
        onClick={apply}
        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
      >
        Tìm
      </button>
    </div>
  );
}
