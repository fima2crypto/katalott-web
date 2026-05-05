import Link from "next/link";
import { fetchP655List } from "@/app/lib/p655/data";
import SoSEQTable from "@/app/(products)/p655/ui/SoSEQ";

export default async function P655SoSEQPage() {
  // Quet du de tim 55 so — 300 ky la thua
  const allData = await fetchP655List({ limit: 300 });

  return (
    <div className="min-h-screen bg-gray-50 font-mono">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <Link href="/p655" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-purple-800">🔢 Power 655 - SoSEQ</h1>
        <span className="text-xs text-gray-400 ml-auto">
          Số kỳ ra gần nhất (1–55), tính từ kỳ hiện tại = 0
        </span>
      </div>

      {/* Table */}
      <div className="p-3">
        <SoSEQTable allData={allData} />
      </div>
    </div>
  );
}