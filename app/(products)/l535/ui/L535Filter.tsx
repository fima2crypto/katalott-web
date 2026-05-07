"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface Props {
  mode: string; tuKy: string; denKy: string; limit: number; qhKy: number;
}

export default function L535Filter({ mode, tuKy, denKy, limit, qhKy }: Props) {
  const router = useRouter();
  const [m, setM] = useState(mode);
  const [fromKy, setFromKy] = useState(tuKy);
  const [toKy, setToKy] = useState(denKy);
  const [lim, setLim] = useState(limit.toString());
  const [qh, setQh] = useState(qhKy.toString());

  function apply() {
    const p = new URLSearchParams();
    p.set("mode", m);
    p.set("qh_ky", qh);
    if (m === "range_ky") {
      p.set("tu_ky", fromKy);
      p.set("den_ky", toKy);
    } else {
      p.set("limit", lim);
    }
    router.push(`?${p.toString()}`);
  }

  const inp = "border border-gray-300 rounded px-2 py-1 text-xs w-24 focus:outline-none focus:border-blue-400";
  const btn = "px-3 py-1 rounded text-xs font-semibold transition-colors";

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs">
      {/* Mode toggle */}
      <div className="flex rounded overflow-hidden border border-gray-300">
        <button
          className={`${btn} ${m === "limit" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          onClick={() => setM("limit")}
        >Số kỳ</button>
        <button
          className={`${btn} ${m === "range_ky" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          onClick={() => setM("range_ky")}
        >Từ-Đến kỳ</button>
      </div>

      {m === "limit" ? (
        <input className={inp} value={lim} onChange={e => setLim(e.target.value)}
          placeholder="Số kỳ" type="number" min={1} />
      ) : (
        <>
          <input className={inp} value={fromKy} onChange={e => setFromKy(e.target.value)} placeholder="Từ kỳ" />
          <span className="text-gray-400">→</span>
          <input className={inp} value={toKy} onChange={e => setToKy(e.target.value)} placeholder="Đến kỳ" />
        </>
      )}

      {/* QH Kỳ */}
      <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
        <span className="text-gray-500">QH:</span>
        <input className={inp} value={qh} onChange={e => setQh(e.target.value)}
          type="number" min={1} style={{ width: 52 }} />
      </div>

      <button
        onClick={apply}
        className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
      >Lọc</button>
    </div>
  );
}
