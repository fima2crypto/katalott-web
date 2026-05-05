import Link from "next/link";
import { fetchM3DPKqList } from "@/app/lib/m3dp/data";
import { M3DPKqRow } from "@/app/lib/m3dp/definitions";
import M3DPFilter from "@/app/(products)/m3dp/ui/M3DPFilter";

// ==================== HELPERS ====================
function fmtDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Mau theo hang tram (chu so X)
const X_COLORS: Record<number, string> = {
  0: "bg-gray-200 text-gray-700",
  1: "bg-red-200 text-red-800",
  2: "bg-orange-200 text-orange-800",
  3: "bg-yellow-200 text-yellow-800",
  4: "bg-green-200 text-green-800",
  5: "bg-teal-200 text-teal-800",
  6: "bg-cyan-200 text-cyan-800",
  7: "bg-blue-200 text-blue-800",
  8: "bg-violet-200 text-violet-800",
  9: "bg-pink-200 text-pink-800",
};

// ==================== COMPONENTS ====================
function NumCell3D({
  val,
  db1Set,
  db2Set,
}: {
  val: string;
  db1Set: Set<string>;
  db2Set: Set<string>;
}) {
  if (!val)
    return (
      <span className="inline-flex items-center justify-center text-xs text-gray-300 w-8">
        -
      </span>
    );

  const xDigit = parseInt(val.padStart(3, "0")[0]);
  let bg = X_COLORS[xDigit] ?? "bg-gray-100";
  // Override neu trung DB1 hoac DB2
  if (db1Set.has(val)) bg = "bg-blue-500 text-white";
  if (db2Set.has(val)) bg = "bg-orange-500 text-white";

  return (
    <span
      className={`inline-flex items-center justify-center text-xs rounded font-mono font-semibold px-1 py-0.5 ${bg}`}
    >
      {val.padStart(3, "0")}
    </span>
  );
}

function CountCell({
  val,
  bgColor,
  db1Has,
  db2Has,
}: {
  val: number;
  bgColor: string;
  db1Has?: boolean;
  db2Has?: boolean;
}) {
  let bg =
    val === 0
      ? "bg-gray-200 text-gray-400"
      : db1Has
        ? "bg-blue-500 text-white"
        : db2Has
          ? "bg-orange-500 text-white"
          : bgColor;
  return (
    <td
      className={`px-1 py-0.5 text-center text-xs border border-gray-200 ${bg}`}
    >
      {val}
    </td>
  );
}

function Th({
  children,
  className = "",
  colSpan,
  rowSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
}) {
  return (
    <th
      colSpan={colSpan}
      rowSpan={rowSpan}
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

// ==================== ROW ====================
function M3DPRow({ row, idx }: { row: M3DPKqRow; idx: number }) {
  const db1 = row.db[0] ?? "";
  const db2 = row.db[1] ?? "";
  const db1Set = new Set(row.n20.filter((s) => s === db1));
  const db2Set = new Set(row.n20.filter((s) => s === db2));

  const db1X = db1 ? parseInt(db1.padStart(3, "0")[0]) : -1;
  const db2X = db2 ? parseInt(db2.padStart(3, "0")[0]) : -1;
  const db1Y = db1 ? parseInt(db1.padStart(3, "0")[1]) : -1;
  const db2Y = db2 ? parseInt(db2.padStart(3, "0")[1]) : -1;
  const db1Z = db1 ? parseInt(db1.padStart(3, "0")[2]) : -1;
  const db2Z = db2 ? parseInt(db2.padStart(3, "0")[2]) : -1;

  // Mau bg theo thu
  const thuTrim = row.thu.trim();
  const thuBg =
    thuTrim === "T3"
      ? "bg-orange-400"
      : thuTrim === "T5"
        ? "bg-blue-400"
        : thuTrim === "T7"
          ? "bg-green-400"
          : "";

  // Mau ky theo db_cnt / gp_cnt
  const kyColor =
    row.db_cnt > 0 && row.gp_cnt > 0
      ? "bg-purple-500 text-white"
      : row.db_cnt > 0
        ? "bg-red-500 text-white"
        : row.gp_cnt > 0
          ? "bg-green-500 text-white"
          : "text-blue-700";

  return (
    <tr className={`hover:bg-blue-50 transition-colors `}>
      <Td className="bg-gray-50 text-gray-500">{idx}</Td>
      <Td className={`font-semibold ${thuBg}`}>{row.thu}</Td>
      <Td className="whitespace-nowrap">{fmtDate(row.ngay)}</Td>
      <Td className={`font-mono font-bold ${kyColor}`}>{row.ky}</Td>

      {/* DB: 2 o rieng */}
      <Td className="p-0.5">
        <NumCell3D val={db1} db1Set={db1Set} db2Set={db2Set} />
      </Td>
      <Td className="p-0.5">
        <NumCell3D val={db2} db1Set={db1Set} db2Set={db2Set} />
      </Td>

      {/* G1: 4 so */}
      {row.g1.map((n, i) => (
        <Td key={`g1-${i}`} className="p-0.5">
          <NumCell3D val={n} db1Set={db1Set} db2Set={db2Set} />
        </Td>
      ))}
      {Array(4 - row.g1.length)
        .fill(null)
        .map((_, i) => (
          <Td key={`g1e-${i}`} />
        ))}

      {/* G2: 6 so */}
      {row.g2.map((n, i) => (
        <Td key={`g2-${i}`} className="p-0.5">
          <NumCell3D val={n} db1Set={db1Set} db2Set={db2Set} />
        </Td>
      ))}
      {Array(6 - row.g2.length)
        .fill(null)
        .map((_, i) => (
          <Td key={`g2e-${i}`} />
        ))}

      {/* G3: 8 so */}
      {row.g3.map((n, i) => (
        <Td key={`g3-${i}`} className="p-0.5">
          <NumCell3D val={n} db1Set={db1Set} db2Set={db2Set} />
        </Td>
      ))}
      {Array(8 - row.g3.length)
        .fill(null)
        .map((_, i) => (
          <Td key={`g3e-${i}`} />
        ))}

      {/* SUM: phan du /10 */}
      <Td className="font-mono bg-yellow-50 whitespace-nowrap">
        {row.sum_db1 % 10}-{row.sum_db2 % 10}
      </Td>

      {/* DBX, DBY, DBZ */}
      <Td className="font-mono">{row.dbx}</Td>
      <Td className="font-mono">{row.dby}</Td>
      <Td className="font-mono">{row.dbz}</Td>

      {/* DD */}
      <Td
        className={`font-bold font-mono tracking-widest ${
          row.dd === "CC"
            ? "text-blue-600"
            : row.dd === "LL"
              ? "text-red-600"
              : "text-purple-600"
        }`}
      >
        {row.dd}
      </Td>

      {/* X0-X9 + XOFF */}
      {row.x.map((cnt, i) => (
        <CountCell
          key={`x${i}`}
          val={cnt}
          bgColor="bg-red-100"
          db1Has={db1X === i}
          db2Has={db2X === i}
        />
      ))}
      <Td className="text-gray-500 text-xs max-w-[60px] truncate">
        {row.xoff}
      </Td>

      {/* Y0-Y9 + YOFF */}
      {row.y.map((cnt, i) => (
        <CountCell
          key={`y${i}`}
          val={cnt}
          bgColor="bg-green-100"
          db1Has={db1Y === i}
          db2Has={db2Y === i}
        />
      ))}
      <Td className="text-gray-500 text-xs max-w-[60px] truncate">
        {row.yoff}
      </Td>

      {/* Z0-Z9 + ZOFF */}
      {row.z.map((cnt, i) => (
        <CountCell
          key={`z${i}`}
          val={cnt}
          bgColor="bg-blue-100"
          db1Has={db1Z === i}
          db2Has={db2Z === i}
        />
      ))}
      <Td className="text-gray-500 text-xs max-w-[60px] truncate">
        {row.zoff}
      </Td>

      {/* SNT */}
      <Td className="text-xs">{row.snt.join("-")}</Td>
      <Td
        className={`font-bold ${row.snt_count >= 6 ? "bg-red-500 text-white" : row.snt_count >= 4 ? "bg-green-500 text-white" : "bg-yellow-50"}`}
      >
        {row.snt_count}
      </Td>

      {/* XX */}
      <Td className="text-xs">{row.xx.join("-")}</Td>
      <Td
        className={`font-bold ${row.xx_count >= 4 ? "bg-red-500 text-white" : row.xx_count === 0 ? "bg-gray-400 text-white" : "bg-yellow-50"}`}
      >
        {row.xx_count}
      </Td>

      {/* TDB */}
      <Td className="font-mono text-xs">{row.tdb_list}</Td>
      <Td
        className={`font-bold ${row.tdb_count >= 2 ? "bg-orange-500 text-white" : row.tdb_count === 0 ? "bg-gray-200" : "bg-yellow-100"}`}
      >
        {row.tdb_count}
      </Td>

      {/* SA3 */}
      <Td className="text-xs">{row.sa3.join("-")}</Td>
      <Td
        className={`font-bold ${row.sa3_count >= 3 ? "bg-red-500 text-white" : row.sa3_count === 0 ? "bg-gray-200 text-gray-400" : "bg-yellow-50"}`}
      >
        {row.sa3_count}
      </Td>

      {/* FIB */}
      <Td className="text-xs">{row.fib.join("-")}</Td>
      <Td
        className={`font-bold ${row.fib_count >= 3 ? "bg-red-500 text-white" : row.fib_count === 0 ? "bg-gray-200 text-gray-400" : "bg-yellow-50"}`}
      >
        {row.fib_count}
      </Td>

      {/* G0 */}
      <Td className="text-xs">{row.g0.join("-")}</Td>
      <Td
        className={`font-bold ${row.g0_count >= 5 ? "bg-red-500 text-white" : row.g0_count >= 3 ? "bg-green-500 text-white" : "bg-yellow-50"}`}
      >
        {row.g0_count}
      </Td>
    </tr>
  );
}

// ==================== TABLE ====================
function M3DPTable({ data }: { data: M3DPKqRow[] }) {
  if (!data.length)
    return (
      <div className="text-center text-gray-400 py-12">Không có dữ liệu</div>
    );

  return (
    <div className="overflow-auto">
      <table className="border-collapse text-xs min-w-max">
        <thead className="sticky top-0 z-10">
          <tr className="bg-gray-100">
            <Th className="bg-gray-200">#</Th>
            <Th className="bg-gray-200">Thứ</Th>
            <Th className="bg-gray-200">Ngày</Th>
            <Th className="bg-gray-200">Kỳ</Th>
            {/* DB */}
            <Th colSpan={2} className="bg-red-100">
              DB
            </Th>
            {/* G1 */}
            <Th colSpan={4} className="bg-orange-100">
              G1
            </Th>
            {/* G2 */}
            <Th colSpan={6} className="bg-yellow-100">
              G2
            </Th>
            {/* G3 */}
            <Th colSpan={8} className="bg-green-100">
              G3
            </Th>
            {/* SUM: 1 cot */}
            <Th className="bg-yellow-200">SUM</Th>
            {/* DBX DBY DBZ */}
            <Th className="bg-purple-100">DBX</Th>
            <Th className="bg-purple-100">DBY</Th>
            <Th className="bg-purple-100">DBZ</Th>
            {/* DD */}
            <Th className="bg-pink-100">DD</Th>
            {/* X0-X9 + XOFF */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <Th key={`xh${i}`} className="bg-red-50">
                X{i}
              </Th>
            ))}
            <Th className="bg-red-50">XOFF</Th>
            {/* Y0-Y9 + YOFF */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <Th key={`yh${i}`} className="bg-green-50">
                Y{i}
              </Th>
            ))}
            <Th className="bg-green-50">YOFF</Th>
            {/* Z0-Z9 + ZOFF */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <Th key={`zh${i}`} className="bg-blue-50">
                Z{i}
              </Th>
            ))}
            <Th className="bg-blue-50">ZOFF</Th>
            {/* SNT */}
            <Th colSpan={2} className="bg-teal-100">
              SNT
            </Th>
            {/* XX */}
            <Th colSpan={2} className="bg-indigo-100">
              XX
            </Th>
            {/* TDB */}
            <Th colSpan={2} className="bg-orange-100">
              TDB
            </Th>
            {/* SA3 FIB */}
            <Th colSpan={2} className="bg-lime-100">
              SA3
            </Th>
            <Th colSpan={2} className="bg-cyan-100">
              FIB
            </Th>
            {/* G0 */}
            <Th colSpan={2} className="bg-blue-100">
              G0
            </Th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <M3DPRow key={row.ky} row={row} idx={idx + 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==================== MAIN ====================
export default async function M3DPKqPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string;
    tu_ky?: string;
    den_ky?: string;
    limit?: string;
  }>;
}) {
  const sp = await searchParams;
  const mode = sp.mode || "limit";
  const limit = parseInt(sp.limit || "20");
  const tu_ky = sp.tu_ky || "";
  const den_ky = sp.den_ky || "";

  const data = await fetchM3DPKqList(
    mode === "range" ? { tu_ky, den_ky } : { limit },
  );

  return (
    <div className="min-h-screen bg-gray-50 font-mono">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 flex-wrap">
        <Link
          href="/"
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
        <h1 className="text-lg font-bold text-blue-800">🎯 3DPro - Kết quả</h1>
        <M3DPFilter mode={mode} tuKy={tu_ky} denKy={den_ky} limit={limit} />
      </div>

      {/* Table */}
      <div className="p-2">
        <M3DPTable data={data} />
      </div>
    </div>
  );
}
