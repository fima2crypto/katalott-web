import { fetchSntData } from "@/app/lib/kenokq/snt_data";
import KenoFilter from "@/app/(products)/keno/ui/KenoFilter";
import SntClient from "@/app/(products)/keno/ui/SntClient";
import Link from "next/link";

export default async function SntPage({
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
  const mode = sp.mode || "range";
  const limit = parseInt(sp.limit || "200");
  const today = new Date().toISOString().slice(0, 10);
  const tu_ngay = sp.tu_ngay || today;
  const den_ngay = sp.den_ngay || today;

  const { total_ky, bac_cnt, data, to_hop } = await fetchSntData(
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
        <h1 className="text-lg font-bold text-blue-800">🔢 SNT</h1>
        <KenoFilter
          mode={mode}
          tuNgay={tu_ngay}
          denNgay={den_ngay}
          limit={limit}
        />
      </div>

      <SntClient
        totalKy={total_ky}
        bacCnt={bac_cnt}
        data={data}
        toHop={to_hop}
      />
    </div>
  );
}
