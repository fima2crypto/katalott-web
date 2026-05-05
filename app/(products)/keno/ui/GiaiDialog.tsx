"use client";

import { useEffect, useState } from "react";

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

function fmtDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function fmtMoney(val: number | null) {
  if (!val) return "";
  return val.toLocaleString("vi-VN");
}

function Th({
  children,
  className = "",
  colSpan = undefined,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <th
      colSpan={colSpan}
      className={`px-1 py-1 text-center text-xs font-semibold border border-gray-300 whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`px-1 py-0.5 text-center text-xs border border-gray-200 ${className}`}
    >
      {children}
    </td>
  );
}

function ZZCell({
  bac,
  trung,
  zz,
}: {
  bac: string;
  trung: string;
  zz: number;
}) {
  const bacNum = parseInt(bac.slice(1));
  const trungNum = parseInt(trung.slice(1));
  const isMatch = bacNum === trungNum;
  const bg = isMatch ? (bac === "b05" ? "bg-orange-400" : "bg-yellow-300") : "";
  return <Td className={bg}>{zz > 0 ? zz : ""}</Td>;
}

interface GiaiDialogProps {
  ky: string;
  onClose: () => void;
}

export default function GiaiDialog({ ky, onClose }: GiaiDialogProps) {
  const [giai, setGiai] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGiai() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/keno/giai/${ky}`);
        if (!res.ok) throw new Error(`Lỗi ${res.status}`);
        const json = await res.json();
        setGiai(json);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGiai();
  }, [ky]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-blue-800 text-white px-4 py-3 flex items-center justify-between">
          <h2 className="font-bold text-sm">
            🏆 Kỳ {ky}
            {giai && (
              <span className="ml-2 text-blue-200 font-normal">
                {fmtDate(giai.ngay)} {giai.gio}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-300 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="overflow-auto p-2 max-h-[80vh]">
          {loading && (
            <div className="text-center py-8 text-gray-400">⏳ Đang tải...</div>
          )}
          {error && <div className="text-red-600 text-sm p-2">⚠️ {error}</div>}
          {giai && (
            <table className="border-collapse text-xs w-full">
              <thead>
                <tr>
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
                <tr className="bg-green-400 font-bold">
                  <Td className="bg-green-400">{fmtMoney(giai.btt_tong)}</Td>
                  {BACS.map((bac) => (
                    <Td key={bac} className="bg-green-400">
                      {fmtMoney(giai.bacs[bac]?.btt)}
                    </Td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRUNGS.map((trung) => {
                  const hasData = BACS.some(
                    (bac) => (giai.bacs[bac]?.trungs?.[trung] ?? 0) > 0,
                  );
                  if (!hasData) return null;
                  return (
                    <tr key={trung} className="hover:bg-blue-50">
                      <Td className="text-gray-500 font-semibold">{trung}</Td>
                      {BACS.map((bac) => {
                        const zz = giai.bacs[bac]?.trungs?.[trung] ?? 0;
                        return (
                          <ZZCell
                            key={`${trung}-${bac}`}
                            bac={bac}
                            trung={trung}
                            zz={zz}
                          />
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
