import Link from "next/link";
import { fetchL535List } from "@/app/lib/l535/data";
import L535Table from "@/app/(products)/l535/ui/L535Table";
import L535Filter from "@/app/(products)/l535/ui/L535Filter";

export default async function L535KqPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string;
    tu_ky?: string; den_ky?: string;
    limit?: string; qh_ky?: string;
  }>;
}) {
  const sp = await searchParams;
  const mode   = sp.mode   || "limit";
  const limit  = parseInt(sp.limit  || "20");
  const qh_ky  = parseInt(sp.qh_ky || "20");
  const tu_ky  = sp.tu_ky  || "";
  const den_ky = sp.den_ky || "";

  let fetchParams: Parameters<typeof fetchL535List>[0];
  if (mode === "range_ky" && tu_ky && den_ky) {
    fetchParams = { tu_ky, den_ky, qh_ky };
  } else {
    fetchParams = { limit, qh_ky };
  }

  const data = await fetchL535List(fetchParams);

  return (
    <div className="min-h-screen bg-gray-50 font-mono">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 flex-wrap">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-green-800">🎯 Lotto 5/35 - Kết quả</h1>

        <L535Filter
          mode={mode}
          tuKy={tu_ky}
          denKy={den_ky}
          limit={limit}
          qhKy={qh_ky}
        />
      </div>

      <L535Table data={data} qhKy={qh_ky} />
    </div>
  );
}
