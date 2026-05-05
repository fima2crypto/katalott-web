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
  tuKy: string;
  denKy: string;
  limit: number;
  qhKy: number;
}

export default function P655Filter({ mode, tuNgay, denNgay, tuKy, denKy, limit, qhKy }: Props) {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState(mode || "limit");
  const [tuNgayInput, setTuNgayInput] = useState(fmtDateDisplay(tuNgay));
  const [denNgayInput, setDenNgayInput] = useState(fmtDateDisplay(denNgay));
  const [tuKyInput, setTuKyInput] = useState(tuKy || "");
  const [denKyInput, setDenKyInput] = useState(denKy || "");
  const [limitVal, setLimitVal] = useState(limit);
  const [qhKyVal, setQhKyVal] = useState(qhKy);

  function apply() {
    const params = new URLSearchParams();
    params.set("mode", currentMode);
    params.set("qh_ky", String(qhKyVal));
    if (currentMode === "range_ngay") {
      const tu = parseDate(tuNgayInput);
      const den = parseDate(denNgayInput);
      if (tu) params.set("tu_ngay", tu);
      if (den) params.set("den_ngay", den);
    } else if (currentMode === "range_ky") {
      if (tuKyInput) params.set("tu_ky", tuKyInput.padStart(5, "0"));
      if (denKyInput) params.set("den_ky", denKyInput.padStart(5, "0"));
    } else {
      params.set("limit", String(limitVal));
    }
    router.push(`?${params.toString()}`);
  }

  const btnBase = "px-3 py-1.5 text-xs";
  const btnActive = "bg-blue-600 text-white";
  const btnInactive = "bg-white text-gray-600 hover:bg-gray-50";

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Mode switch */}
      <div className="flex items-center gap-0 border border-gray-300 rounded overflow-hidden text-xs">
        <button onClick={() => setCurrentMode("limit")}
          className={`${btnBase} ${currentMode === "limit" ? btnActive : btnInactive}`}>
          Số kỳ
        </button>
        <button onClick={() => setCurrentMode("range_ky")}
          className={`${btnBase} ${currentMode === "range_ky" ? btnActive : btnInactive} border-l border-gray-300`}>
          Từ kỳ
        </button>
        <button onClick={() => setCurrentMode("range_ngay")}
          className={`${btnBase} ${currentMode === "range_ngay" ? btnActive : btnInactive} border-l border-gray-300`}>
          Khoảng ngày
        </button>
      </div>

      {/* Inputs filter chinh */}
      {currentMode === "range_ngay" && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-600">Từ:</label>
            <input type="text" placeholder="dd/mm/yyyy"
              value={tuNgayInput}
              onChange={e => setTuNgayInput(autoSlash(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-xs w-28" />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-600">Đến:</label>
            <input type="text" placeholder="dd/mm/yyyy"
              value={denNgayInput}
              onChange={e => setDenNgayInput(autoSlash(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-xs w-28" />
          </div>
        </div>
      )}
      {currentMode === "range_ky" && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-600">Từ kỳ:</label>
            <input type="number" placeholder="00001"
              value={tuKyInput}
              onChange={e => setTuKyInput(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-xs w-24" />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-600">Đến kỳ:</label>
            <input type="number" placeholder="01340"
              value={denKyInput}
              onChange={e => setDenKyInput(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-xs w-24" />
          </div>
        </div>
      )}
      {currentMode === "limit" && (
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-600">Số kỳ:</label>
          <input type="number" min={1} max={500}
            value={limitVal}
            onChange={e => setLimitVal(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-xs w-20" />
        </div>
      )}

      {/* QH Ky: label -> input */}
      <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
        <label className="text-xs text-gray-600">QH kỳ:</label>
        <input type="number" min={5} max={200}
          value={qhKyVal}
          onChange={e => setQhKyVal(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-xs w-16 text-center" />
      </div>

      <button onClick={apply}
        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
        Tìm
      </button>
    </div>
  );
}
