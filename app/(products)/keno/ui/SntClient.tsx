"use client";

import { useState } from "react";
import GiaiDialog from "@/app/(products)/keno/ui/GiaiDialog";

function fmtDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function Th({
  children,
  className = "",
  colSpan,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
  onClick?: () => void;
}) {
  return (
    <th
      colSpan={colSpan}
      onClick={onClick}
      className={`px-2 py-1 text-center text-xs font-semibold border border-gray-300 whitespace-nowrap ${onClick ? "cursor-pointer hover:bg-gray-200" : ""} ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <td
      onClick={onClick}
      className={`px-2 py-1 text-center text-xs border border-gray-200 ${className}`}
    >
      {children}
    </td>
  );
}

function CntCell({ cnt }: { cnt: number }) {
  const bg =
    cnt >= 5
      ? "bg-red-500 text-white"
      : cnt >= 3
        ? "bg-green-500 text-white"
        : "";
  return <Td className={`font-bold ${bg}`}>{cnt}</Td>;
}

interface Props {
  totalKy: number;
  bacCnt: { bac: number; cnt: number }[];
  data: any[];
  toHop: any[];
}

export default function SntClient({ totalKy, bacCnt, data, toHop }: Props) {
  const [selectedKy, setSelectedKy] = useState<string | null>(null);
  const [selectedBac, setSelectedBac] = useState(5);
  const [toHopSort, setToHopSort] = useState<"cnt" | "cach_ky">("cnt");
  const [toHopSortDir, setToHopSortDir] = useState<"desc" | "asc">("desc");

  const filteredData = data.filter((r) => r.cnt === selectedBac);

  const filteredToHop = toHop
    .filter((r) => r.snt_str.split("-").length === selectedBac)
    .sort((a, b) => {
      const dir = toHopSortDir === "desc" ? -1 : 1;
      return dir * (a[toHopSort] - b[toHopSort]);
    });

  function toggleSort(col: "cnt" | "cach_ky") {
    if (toHopSort === col)
      setToHopSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setToHopSort(col);
      setToHopSortDir("desc");
    }
  }

  function sortIcon(col: "cnt" | "cach_ky") {
    if (toHopSort !== col) return " ↕";
    return toHopSortDir === "desc" ? " ↓" : " ↑";
  }

  return (
    <>
      {selectedKy && (
        <GiaiDialog ky={selectedKy} onClose={() => setSelectedKy(null)} />
      )}

      <div className="flex gap-4 p-4 overflow-auto items-start">
        {/* Bảng 1: BAC - CNT */}
        <div className="flex-shrink-0">
          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <Th className="bg-gray-100">BAC</Th>
                <Th className="bg-red-300 text-red-900">{totalKy}</Th>
              </tr>
            </thead>
            <tbody>
              {bacCnt.map(({ bac, cnt }) => {
                const isSelected = bac === selectedBac;
                return (
                  <tr
                    key={bac}
                    onClick={() => setSelectedBac(bac)}
                    className={`cursor-pointer hover:bg-yellow-50 ${isSelected ? "bg-yellow-300 font-bold" : ""}`}
                  >
                    <Td className={isSelected ? "bg-yellow-300 font-bold" : ""}>
                      {bac}
                    </Td>
                    <Td className={isSelected ? "bg-yellow-300 font-bold" : ""}>
                      {cnt}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bảng 2: chi tiết kỳ */}
        <div className="flex-shrink-0 overflow-auto max-h-[80vh]">
          <table className="border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr>
                <Th className="bg-gray-100">STT</Th>
                <Th className="bg-gray-100">Ngày</Th>
                <Th className="bg-gray-100">Kỳ</Th>
                <Th className="bg-red-200">SNT</Th>
                <Th className="bg-blue-100">Cách kỳ</Th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr
                    key={row.ky}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <Td className="bg-gray-50 text-gray-500">{idx + 1}</Td>
                    <Td className="whitespace-nowrap">
                      {fmtDate(row.ngay)} {row.gio}
                    </Td>
                    <Td
                      className={`font-mono cursor-pointer hover:underline font-bold
                        ${
                          row.jackpot_red
                            ? "bg-red-500 text-white"
                            : row.jackpot_green
                              ? "bg-green-500 text-white"
                              : "text-blue-700 hover:text-blue-900"
                        }`}
                      onClick={() => setSelectedKy(row.ky)}
                    >
                      {row.ky}
                    </Td>
                    <Td className="text-left font-mono">{row.snt_str}</Td>
                    <Td className="text-gray-500">{row.cach_ky}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bảng 3: tổ hợp */}
        <div className="flex-shrink-0 overflow-auto max-h-[80vh]">
          <table className="border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr>
                <Th className="bg-gray-100">STT</Th>
                <Th className="bg-red-200" onClick={() => toggleSort("cnt")}>
                  CNT{sortIcon("cnt")}
                </Th>
                <Th className="bg-gray-100">Dãy số</Th>
                <Th
                  className="bg-blue-100"
                  onClick={() => toggleSort("cach_ky")}
                >
                  Cách kỳ{sortIcon("cach_ky")}
                </Th>
              </tr>
            </thead>
            <tbody>
              {filteredToHop.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredToHop.map((row, idx) => (
                  <tr
                    key={row.snt_str}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <Td className="bg-gray-50 text-gray-500">{idx + 1}</Td>
                    <CntCell cnt={row.cnt} />
                    <Td className="text-left font-mono">{row.snt_str}</Td>
                    <Td className="text-gray-500">{row.cach_ky}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
