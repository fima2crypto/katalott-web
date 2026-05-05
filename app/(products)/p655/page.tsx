import Link from "next/link";
import { fetchP655List } from "@/app/lib/p655/data";
import P655Table from "@/app/(products)/p655/ui/P655Table";
import P655Filter from "@/app/(products)/p655/ui/P655Filter";
import SoSEQDialog from "@/app/(products)/p655/ui/SoSEQDialog";

function todayISO() { return new Date().toISOString().slice(0, 10); }

export default async function P655KqPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string; tu_ngay?: string; den_ngay?: string;
    tu_ky?: string; den_ky?: string; limit?: string; qh_ky?: string;
  }>;
}) {
  const sp = await searchParams;
  const mode = sp.mode || "limit";
  const limit = parseInt(sp.limit || "20");
  const qh_ky = parseInt(sp.qh_ky || "20");
  const today = todayISO();
  const tu_ngay = sp.tu_ngay || today;
  const den_ngay = sp.den_ngay || today;
  const tu_ky = sp.tu_ky || "";
  const den_ky = sp.den_ky || "";

  let fetchParams: Parameters<typeof fetchP655List>[0] = { limit: 20, qh_ky };
  if (mode === "range_ky" && tu_ky && den_ky) fetchParams = { tu_ky, den_ky, qh_ky };
  else if (mode === "range_ngay" && tu_ngay && den_ngay) fetchParams = { tu_ngay, den_ngay, qh_ky };
  else fetchParams = { limit, qh_ky };

  const data = await fetchP655List(fetchParams);

  return (
    <div className="min-h-screen bg-gray-50 font-mono">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 flex-wrap">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-purple-800">🎱 Power 655 - Kết quả</h1>

        {/* Filter chinh */}
        <P655Filter
          mode={mode} tuNgay={tu_ngay} denNgay={den_ngay}
          tuKy={tu_ky} denKy={den_ky} limit={limit} qhKy={qh_ky}
        />

        {/* Nhom phai: QH ky + SoSEQ */}
        <div className="flex items-center gap-3 ml-auto border-l border-gray-200 pl-3">
          <SoSEQDialog qhKy={qh_ky} />
        </div>
      </div>

      <P655Table data={data} qhKy={qh_ky} />
    </div>
  );
}