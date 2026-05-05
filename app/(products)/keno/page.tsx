import Link from "next/link";
import { fetchKenoKqList } from "@/app/lib/kenokq/data";
import KenoKqTable from "@/app/(products)/keno/ui/KenoKqTable";
import { KenoKqRow } from "@/app/lib/kenokq/kenokq_definitions";

// ==================== HELPERS ====================
function fmtDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function parseDateInput(ddmmyyyy: string): string {
  if (!ddmmyyyy) return "";
  const parts = ddmmyyyy.split("/");
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return "";
}

// ==================== COMPONENTS ====================
function NumCell({ n }: { n: number }) {
  if (!n)
    return (
      <span className="w-6 h-6 inline-flex items-center justify-center text-xs text-gray-300">
        -
      </span>
    );
  const dec = Math.floor(n / 10);
  const colors = [
    "bg-orange-400",
    "bg-yellow-400",
    "bg-green-400",
    "bg-cyan-400",
    "bg-blue-600",
    "bg-purple-400",
    "bg-lime-400",
    "bg-sky-400",
    "bg-red-400",
  ];
  const bg = n === 80 ? "" : colors[dec] || "bg-gray-100";
  const style = n === 80 ? { backgroundColor: "#ef4444", color: "white" } : {};
  return (
    <span
      className={`w-6 h-6 inline-flex items-center justify-center text-xs rounded font-sans ${bg}`}
      style={style}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

function CountCell({ val, bgHeader }: { val: number; bgHeader: string }) {
  const bg = val === 0 ? "bg-gray-200" : val >= 5 ? "bg-red-500" : bgHeader;
  const color = val === 0 ? "text-gray-400" : "text-black";
  return (
    <td
      className={`px-1 py-0.5 text-center text-xs border border-gray-200 ${bg}`}
    >
      <span className={color}>{val}</span>
    </td>
  );
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

function KenoRow({ row, idx }: { row: KenoKqRow; idx: number }) {
  const kyColor = row.jackpot_red
    ? "bg-red-500 text-white"
    : row.jackpot_green
      ? "bg-green-500 text-white"
      : "text-blue-700";

  return (
    <tr className="hover:bg-blue-50 transition-colors">
      <Td className="bg-gray-50 text-gray-500">{idx}</Td>
      <Td className="whitespace-nowrap">
        {fmtDate(row.ngay)} {row.gio}
      </Td>
      <Td className={`font-mono font-bold ${kyColor}`}>{row.ky}</Td>

      {/* 20 so */}
      {row.nums.map((n, i) => (
        <Td key={i} className="p-0.5">
          <NumCell n={n} />
        </Td>
      ))}

      {/* G0 */}
      <Td>{row.g0_count > 0 ? row.g0.join(",") : ""}</Td>
      <Td
        className={`font-bold w-8 min-w-[2rem] ${row.g0_count >= 7 ? "bg-red-500 text-white" : row.g0_count >= 5 ? "bg-green-500 text-white" : "bg-yellow-50"}`}
      >
        {row.g0_count}
      </Td>

      {/* XX */}
      <Td>{row.xx_count > 0 ? row.xx.join(",") : ""}</Td>
      <Td
        className={`w-8 min-w-[2rem] ${row.xx_count >= 4 ? "bg-red-500 text-white" : row.xx_count === 0 ? "bg-gray-400 text-white" : "bg-yellow-50"}`}
      >
        {row.xx_count}
      </Td>

      {/* SNT */}
      <Td>{row.snt_count > 0 ? row.snt.join(",") : ""}</Td>
      <Td
        className={`font-bold w-8 min-w-[2rem] ${row.snt_count >= 7 ? "bg-red-500 text-white" : row.snt_count >= 5 ? "bg-green-500 text-white" : "bg-yellow-50"}`}
      >
        {row.snt_count}
      </Td>

      {/* HT0-HT7 */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <CountCell
          key={`ht${i}`}
          val={row[`ht${i}` as keyof KenoKqRow] as number}
          bgHeader="bg-cyan-100"
        />
      ))}

      {/* VT */}
      {[1, 2, 3, 5, 7, 9].map((i) => (
        <CountCell
          key={`vt${i}`}
          val={row[`vt${i}` as keyof KenoKqRow] as number}
          bgHeader="bg-yellow-100"
        />
      ))}

      {/* H0-H8 */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <CountCell
          key={`h${i}`}
          val={row[`h${i}` as keyof KenoKqRow] as number}
          bgHeader="bg-blue-100"
        />
      ))}

      {/* V0-V9 */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <CountCell
          key={`v${i}`}
          val={row[`v${i}` as keyof KenoKqRow] as number}
          bgHeader="bg-green-100"
        />
      ))}
    </tr>
  );
}

// ==================== FILTER FORM ====================
import KenoFilter from "@/app/(products)/keno/ui/KenoFilter";

// ==================== MAIN ====================
export default async function KenoKqPage({
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

  const today = todayISO();
  const tu_ngay = sp.tu_ngay || today;
  const den_ngay = sp.den_ngay || today;

  const data = await fetchKenoKqList(
    mode === "range" ? { tu_ngay, den_ngay } : { limit },
  );

  return (
    <div className="min-h-screen bg-gray-50 font-mono">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 flex-wrap">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-blue-800">📋 Kết quả</h1>
        <KenoFilter
          mode={mode}
          tuNgay={tu_ngay}
          denNgay={den_ngay}
          limit={limit}
        />
        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/keno/jackpot"
            className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors"
          >
            🎯 Jackpot
          </Link>
          <Link
            href="/keno/giai"
            className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors"
          >
            🏆 Giải thưởng
          </Link>
          <Link
            href="/keno/snt"
            className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition-colors"
          >
            🔢 SNT
          </Link>
          <Link
            href="/keno/trx"
            className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium transition-colors"
          >
            🎟 DS Vé
          </Link>
        </div>
      </div>

      {/* Table */}
      <KenoKqTable data={data} />
    </div>
  );
}
