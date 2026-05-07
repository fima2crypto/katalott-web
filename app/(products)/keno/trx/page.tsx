import { fetchKenoTrxList, extractTickets } from "@/app/lib/kenotrx/data";
import { updateKenoTrxStatus } from "@/app/lib/kenotrx/actions";
import Link from "next/link";

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("vi-VN");
}

function TicketBadge({ label, soChon, gia }: { label: string; soChon: string; gia: number }) {
  const nums = soChon.trim().split(/\s+/).filter(Boolean);
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="font-bold text-gray-500 w-4">{label}</span>
      <div className="flex flex-wrap gap-0.5">
        {nums.map((n, i) => (
          <span key={i} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-mono">{n}</span>
        ))}
      </div>
      <span className="text-gray-400 ml-1">{gia}k</span>
    </div>
  );
}

export default async function KenoTrxPage() {
  const list = await fetchKenoTrxList();

  return (
    <div className="min-h-screen bg-gray-50 font-mono p-4">
      <div className="flex items-center justify-between mb-4">
        <Link href="/keno" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-blue-800">🎟 Vé Keno</h1>
        <Link href="/keno/trx/create"
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          + Tạo vé
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">Không có vé nào đang mua</div>
      ) : (
        <div className="overflow-auto">
          <table className="border-collapse text-xs w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-2 border border-gray-300 text-left">ID</th>
                <th className="px-2 py-2 border border-gray-300">Ngày</th>
                <th className="px-2 py-2 border border-gray-300">Từ Kỳ</th>
                <th className="px-2 py-2 border border-gray-300">Số Kỳ</th>
                <th className="px-2 py-2 border border-gray-300 text-left">Dãy số</th>
                <th className="px-2 py-2 border border-gray-300">Status</th>
                <th className="px-2 py-2 border border-gray-300">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => {
                const tickets = extractTickets(row);
                const id = row.id.trim();
                const markDone = updateKenoTrxStatus.bind(null, id, "done");

                return (
                  <tr key={id} className="hover:bg-blue-50 border-b border-gray-200">
                    <td className="px-2 py-2 border border-gray-200 font-bold text-blue-700">{id}</td>
                    <td className="px-2 py-2 border border-gray-200 text-center whitespace-nowrap">{fmtDate(row.ngay)}</td>
                    <td className="px-2 py-2 border border-gray-200 text-center font-mono">{row.tu_ky?.trim()}</td>
                    <td className="px-2 py-2 border border-gray-200 text-center">{row.so_ky}</td>
                    <td className="px-2 py-2 border border-gray-200">
                      <div className="flex flex-col gap-1">
                        {tickets.map((t) => (
                          <TicketBadge key={t.label} label={t.label} soChon={t.so_chon} gia={t.gia} />
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-2 border border-gray-200 text-center">
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">
                        {row.status?.trim()}
                      </span>
                    </td>
                    <td className="px-2 py-2 border border-gray-200">
                      <div className="flex flex-col gap-1 min-w-[80px]">
                        {/* Sua */}
                        <Link href={`/keno/trx/${id}/edit`}
                          className="px-2 py-1 text-xs bg-yellow-400 text-yellow-900 rounded hover:bg-yellow-500 text-center block">
                          ✏️ Sửa
                        </Link>
                        {/* Xem KQ - link truc tiep, tinh toan on-the-fly */}
                        <Link href={`/keno/trx/${id}/kq`}
                          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 text-center block">
                          🎯 Xem KQ
                        </Link>
                        {/* Done */}
                        <form action={markDone}>
                          <button type="submit"
                            className="w-full px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500">
                            ✓ Done
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
