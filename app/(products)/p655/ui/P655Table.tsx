"use client";

import { P655Row } from "@/app/lib/p655/definitions";

const DEC_COLORS: Record<number, string> = {
  0: "bg-red-400 text-white",    1: "bg-orange-400 text-white",
  2: "bg-yellow-400 text-black", 3: "bg-green-500 text-white",
  4: "bg-blue-500 text-white",   5: "bg-purple-500 text-white",
};
const DD_COLORS: Record<string, string> = {
  CC: "bg-green-600 text-white", CL: "bg-yellow-400 text-black",
  LC: "bg-cyan-400 text-black",  LL: "bg-lime-400 text-black",
};
const THU_COLORS: Record<string, string> = {
  T3: "bg-blue-500 text-white",
  T5: "bg-purple-500 text-white",
  T7: "bg-orange-500 text-white",
};
const BG_COT = "bg-yellow-100";

function fmtDate(d: string) {
  if (!d) return "";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
}

function fmtAmt(amt: number | null): string {
  if (!amt) return "";
  if (amt >= 1_000_000_000) return `${(amt/1_000_000_000).toFixed(1)}B`;
  if (amt >= 1_000_000) return `${(amt/1_000_000).toFixed(0)}M`;
  return amt.toLocaleString();
}

function numBg(n: number) {
  return DEC_COLORS[Math.floor(n/10)] ?? "bg-gray-200 text-black";
}

function Th({ children, className="", colSpan }: {
  children: React.ReactNode; className?: string; colSpan?: number;
}) {
  return <th colSpan={colSpan} className={`px-1 py-1 text-center text-xs font-semibold border border-gray-300 whitespace-nowrap ${className}`}>{children}</th>;
}

function Td({ children, className="" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-1 py-0.5 text-center text-xs border border-gray-200 whitespace-nowrap ${className}`}>{children}</td>;
}

function NumCell({ n }: { n: number }) {
  if (!n) return <span className="w-7 h-6 inline-flex items-center justify-center text-xs text-gray-300">-</span>;
  return <span className={`w-7 h-6 inline-flex items-center justify-center text-xs rounded font-bold ${numBg(n)}`}>{String(n).padStart(2,"0")}</span>;
}

function DecCell({ val }: { val: number }) {
  if (val === 0) return <td className="px-1 py-0.5 text-center text-xs border border-gray-200 bg-gray-200 text-gray-400">0</td>;
  return <td className={`px-1 py-0.5 text-center text-xs border border-gray-200 ${val >= 3 ? "bg-amber-700 text-white" : "bg-white text-black"}`}>{val}</td>;
}

function JppCell({ val }: { val: number | null }) {
  if (val === null) return <td className="px-1 py-0.5 text-center text-xs border border-gray-200 text-gray-300">—</td>;
  const bg = val <= 5 ? "bg-green-100 text-green-800" : val <= 15 ? "bg-yellow-100 text-yellow-800" : val <= 30 ? "bg-orange-200 text-orange-900" : "bg-red-300 text-red-900";
  return <td className={`px-1 py-0.5 text-center text-xs border border-gray-200 font-bold ${bg}`}>{val}</td>;
}

function CntCell({ val }: { val: number | null }) {
  if (val === null) return <td className={`px-1 py-0.5 text-center text-xs border border-gray-200 ${BG_COT} text-gray-300`}>—</td>;
  return <td className={`px-1 py-0.5 text-center text-xs border border-gray-200 ${BG_COT}`}>{val}</td>;
}

function P655RowComp({ row, idx, qhKy }: { row: P655Row; idx: number; qhKy: number }) {
  const ngayBg = (row.jp1_cnt > 0 && row.jp2_cnt > 0) ? "bg-purple-500 text-white font-bold"
    : row.jp1_cnt > 0 ? "bg-red-500 text-white font-bold"
    : row.jp2_cnt > 0 ? "bg-green-500 text-white font-bold" : "";

  return (
    <tr className="hover:bg-blue-50 transition-colors">
      <Td className="bg-gray-50 text-gray-500">{idx}</Td>
      <Td className={`font-semibold ${THU_COLORS[row.thu] ?? ""}`}>{row.thu}</Td>
      <Td className={`whitespace-nowrap ${ngayBg}`}>{fmtDate(row.ngay)}</Td>
      <Td className={`font-mono font-bold ${BG_COT}`}>{row.ky}</Td>

      {[row.n1,row.n2,row.n3,row.n4,row.n5,row.n6].map((n,i) => <Td key={i} className="p-0.5"><NumCell n={n} /></Td>)}
      <Td className="p-0.5 bg-yellow-100"><NumCell n={row.n7} /></Td>

      <DecCell val={row.dec0}/><DecCell val={row.dec1}/><DecCell val={row.dec2}/>
      <DecCell val={row.dec3}/><DecCell val={row.dec4}/><DecCell val={row.dec5}/>

      <Td className={DD_COLORS[row.dd] ?? ""}>{row.dd}</Td>
      <Td>{row.sc}</Td>
      <Td className={BG_COT}>{row.cam}</Td>
      <Td>{row.snt.length > 0 ? row.snt.join("-") : ""}</Td>
      <Td className={BG_COT}>{row.snt_cnt > 0 ? row.snt_cnt : ""}</Td>
      <Td>{row.xx.length > 0 ? row.xx.join("-") : ""}</Td>
      <Td>{row.ke > 0 ? row.ke : ""}</Td>
      <Td>{row.t1 > 0 ? row.t1 : ""}</Td>
      <Td className={BG_COT}>{row.g0 > 0 ? row.g0 : ""}</Td>
      <Td>{row.p1 > 0 ? row.p1 : ""}</Td>
      <Td className={BG_COT}>{row.mod || ""}</Td>
      <Td>{row.sum}</Td>

      {/* Level */}
      <Td className="font-mono">{row.level}</Td>
      <CntCell val={row.level_cnt} />

      {/* 6CL */}
      <Td className="font-mono">{row.cl6}</Td>
      <CntCell val={row.cl6_cnt} />

      <JppCell val={row.jpp} />

      {/* JPMatch */}
      <Td className="text-left text-gray-700 max-w-[180px] whitespace-normal">{row.jpm_info}</Td>
      <Td className={row.jpm_cnt >= 5 ? "bg-red-400 text-white font-bold" : row.jpm_cnt >= 4 ? "bg-orange-300 font-bold" : row.jpm_cnt >= 3 ? "bg-yellow-200" : ""}>{row.jpm_cnt > 0 ? row.jpm_cnt : ""}</Td>

      <Td className="text-red-600 font-semibold">{row.qh_hit.length > 0 ? row.qh_hit.join(",") : ""}</Td>
      <Td className="text-gray-600 text-left whitespace-normal max-w-[140px]">{row.qhl.length > 0 ? row.qhl.join(",") : ""}</Td>
      <Td className={BG_COT}>{row.qhc > 0 ? row.qhc : ""}</Td>
      <Td className={row.jp1ck === 0 ? "bg-red-500 text-white font-bold" : ""}>{row.jp1ck}</Td>
      <Td className={row.jp1_amt ? "text-red-700 font-semibold" : ""}>{fmtAmt(row.jp1_amt)}</Td>
      <Td className={row.jp2_amt ? "text-green-700 font-semibold" : ""}>{fmtAmt(row.jp2_amt)}</Td>
    </tr>
  );
}

export default function P655Table({ data, qhKy = 20 }: { data: P655Row[]; qhKy?: number }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Không có dữ liệu</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs w-full min-w-max">
        <thead className="sticky top-0 z-10">
          <tr className="bg-gray-100">
            <Th className="bg-gray-200">#</Th>
            <Th className="bg-gray-200">Thứ</Th>
            <Th className="bg-gray-200">Ngày</Th>
            <Th className={BG_COT}>Kỳ</Th>
            {[1,2,3,4,5,6].map(i => <Th key={i} className="bg-blue-50">N{i}</Th>)}
            <Th className="bg-yellow-100">N7</Th>
            {[0,1,2,3,4,5].map(i => <Th key={i} className="bg-orange-50">{i}x</Th>)}
            <Th className="bg-cyan-100">DD</Th>
            <Th className="bg-gray-100">SC</Th>
            <Th className={BG_COT}>CAM</Th>
            <Th colSpan={2} className="bg-green-100">SNT</Th>
            <Th className="bg-gray-100">XX</Th>
            <Th className="bg-gray-100">KE</Th>
            <Th className="bg-gray-100">T1</Th>
            <Th className={BG_COT}>G0</Th>
            <Th className="bg-gray-100">P1</Th>
            <Th className={BG_COT}>MOD</Th>
            <Th className="bg-gray-100">SUM</Th>
            <Th colSpan={2} className="bg-indigo-100">Level</Th>
            <Th colSpan={2} className="bg-teal-100">6CL</Th>
            <Th className="bg-pink-100">JPP</Th>
            <Th colSpan={2} className="bg-violet-100">JPMatch</Th>
            <Th className="bg-red-100">&gt;{qhKy}</Th>
            <Th className="bg-gray-50">QHL</Th>
            <Th className={BG_COT}>QHC</Th>
            <Th className="bg-red-50">JP1CK</Th>
            <Th className="bg-red-50">JP1Amt</Th>
            <Th className="bg-green-50">JP2Amt</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => <P655RowComp key={row.ky} row={row} idx={i+1} qhKy={qhKy} />)}
        </tbody>
      </table>
    </div>
  );
}
