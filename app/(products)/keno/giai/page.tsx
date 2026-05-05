import React from "react";
import Link from "next/link";
import { fetchGiaiList } from "@/app/lib/kenokq/giai_data";
import KenoFilter from "@/app/(products)/keno/ui/KenoFilter";

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
  colSpan,
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

function BttRow({ ky_data }: { ky_data: any }) {
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

function TrungRows({ ky_data }: { ky_data: any }) {
  return (
    <>
      {TRUNGS.map((trung) => {
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
                  bac={bac}
                  trung={trung}
                  zz={zz}
                />
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

export default async function GiaiPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string;
    tu_ngay?: string;
    den_ngay?: string;
    limit?: string;
  }>;
}) {
  const sp = await searchParams;
  const mode = sp.mode || "limit";
  const limit = parseInt(sp.limit || "20");
  const today = new Date().toISOString().slice(0, 10);
  const tu_ngay = sp.tu_ngay || today;
  const den_ngay = sp.den_ngay || today;

  const data = await fetchGiaiList(
    mode === "range" ? { tu_ngay, den_ngay } : { limit },
  );

  return (
    <div className="min-h-screen bg-gray-50 font-mono">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 flex-wrap">
        <Link
          href="/keno"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-blue-800">🏆 Giải thưởng</h1>
        <KenoFilter
          mode={mode}
          tuNgay={tu_ngay}
          denNgay={den_ngay}
          limit={limit}
        />
      </div>

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
            {data.length === 0 ? (
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
