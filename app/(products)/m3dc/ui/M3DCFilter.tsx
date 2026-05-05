"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  mode: string;
  tuKy: string;
  denKy: string;
  limit: number;
}

export default function M3DPFilter({ mode, tuKy, denKy, limit }: Props) {
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState(mode || "limit");
  const [tuKyInput, setTuKyInput] = useState(tuKy);
  const [denKyInput, setDenKyInput] = useState(denKy);
  const [limitVal, setLimitVal] = useState(limit);

  function apply() {
    const params = new URLSearchParams();
    params.set("mode", currentMode);
    if (currentMode === "range") {
      if (tuKyInput) params.set("tu_ky", tuKyInput.trim());
      if (denKyInput) params.set("den_ky", denKyInput.trim());
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
          Từ kỳ → Đến kỳ
        </button>
      </div>

      {/* Inputs */}
      {currentMode === "range" ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <label className="text-sm text-gray-600">Từ kỳ:</label>
            <input
              type="text"
              placeholder="00001"
              value={tuKyInput}
              onChange={(e) => setTuKyInput(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-20 font-mono"
            />
          </div>
          <div className="flex items-center gap-1">
            <label className="text-sm text-gray-600">Đến kỳ:</label>
            <input
              type="text"
              placeholder="00020"
              value={denKyInput}
              onChange={(e) => setDenKyInput(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-20 font-mono"
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

      {/* Apply */}
      <button
        onClick={apply}
        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
      >
        Tìm
      </button>
    </div>
  );
}
