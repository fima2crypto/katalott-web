import { fetchKenoTrxById, fetchKenoTrxKq } from "@/app/lib/kenotrx/data";
import { doKenoTrxKq } from "@/app/lib/kenotrx/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { KenoTrx, KenoTrxKq } from "@/app/lib/kenotrx/definitions";

function fmtMoney(val: number | null) {
  if (!val) return "-";
  return val.toLocaleString("vi-VN");
}

function SoTrungHighlight({
  soChon,
  soTrung,
}: {
  soChon: string | null;
  soTrung: string | null;
}) {
  if (!soChon) return <span className="text-gray-300">-</span>;
  const nums = soChon.trim().split(/\s+/).filter(Boolean);
  const trungSet = new Set((soTrung || "").trim().split(/\s+/).filter(Boolean));
  return (
    <div className="flex flex-wrap gap-0.5 justify-center">
      {nums.map((n, i) => (
        <span
          key={i}
          className={`px-1 py-0.5 rounded text-xs font-mono font-bold
            ${trungSet.has(n) ? "bg-green-500 text-white" : "bg-gray-100 text-gray-300"}`}
        >
          {n}
        </span>
      ))}
    </div>
  );
}

// ==================== VIEW 1: Ky -> Ticket ====================
function View1({
  kyMap,
  kyList,
  tickets,
}: {
  kyMap: Record<string, KenoTrxKq[]>;
  kyList: string[];
  tickets: string[];
}) {
  return (
    <table className="border-collapse text-xs w-full bg-white shadow rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-3 py-2 border border-gray-300 text-center w-28">
            Kỳ
          </th>
          <th className="px-3 py-2 border border-gray-300 text-center w-16">
            Ticket
          </th>
          <th className="px-3 py-2 border border-gray-300 text-center">
            Số trúng
          </th>
          <th className="px-3 py-2 border border-gray-300 text-center w-12">
            CNT
          </th>
          <th className="px-3 py-2 border border-gray-300 text-center w-24">
            Thưởng
          </th>
        </tr>
      </thead>
      <tbody>
        {kyList.map((ky, kyIdx) => {
          const rows = kyMap[ky] || [];
          const rowMap: Record<string, KenoTrxKq> = {};
          for (const r of rows) rowMap[r.ticket.trim()] = r;
          const kyThuong = rows.reduce((s, r) => s + (r.thuong || 0), 0);

          return (
            <>
              {/* Dong ky - highlight vang */}
              <tr key={`${ky}-header`} className="bg-yellow-100">
                <td className="px-3 py-1.5 border border-gray-200 font-mono font-bold text-gray-700">
                  ({kyIdx + 1}) {ky}
                </td>
                <td className="px-3 py-1.5 border border-gray-200"></td>
                <td className="px-3 py-1.5 border border-gray-200"></td>
                <td className="px-3 py-1.5 border border-gray-200"></td>
                <td className="px-3 py-1.5 border border-gray-200 text-right font-bold text-green-600">
                  {kyThuong > 0 ? fmtMoney(kyThuong) : ""}
                </td>
              </tr>

              {/* Dong tung ticket */}
              {tickets.map((t) => {
                const kq = rowMap[t];
                return (
                  <tr
                    key={`${ky}-${t}`}
                    className={`hover:bg-blue-50 ${(kq?.thuong || 0) > 0 ? "bg-green-50" : ""}`}
                  >
                    <td className="px-3 py-1.5 border border-gray-200"></td>
                    <td className="px-3 py-1.5 border border-gray-200 text-center font-bold text-blue-700">
                      {t}
                    </td>
                    <td className="px-3 py-1.5 border border-gray-200">
                      <SoTrungHighlight
                        soChon={kq?.so_chon ?? null}
                        soTrung={kq?.so_trung ?? null}
                      />
                    </td>
                    <td className="px-3 py-1.5 border border-gray-200 text-center font-bold">
                      <span
                        className={
                          (kq?.so_cnt || 0) > 0
                            ? "text-green-600"
                            : "text-gray-300"
                        }
                      >
                        {kq?.so_cnt ?? "-"}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 border border-gray-200 text-right">
                      <span
                        className={
                          (kq?.thuong || 0) > 0
                            ? "text-green-600 font-bold"
                            : "text-gray-300"
                        }
                      >
                        {fmtMoney(kq?.thuong ?? null)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </>
          );
        })}

        {/* Tong */}
        <tr className="bg-gray-100 font-bold">
          <td
            colSpan={4}
            className="px-3 py-2 border border-gray-300 text-right"
          >
            Tổng:
          </td>
          <td className="px-3 py-2 border border-gray-300 text-right text-green-600 text-base">
            {fmtMoney(
              kyList.reduce(
                (s, ky) =>
                  s +
                  (kyMap[ky] || []).reduce((ss, r) => ss + (r.thuong || 0), 0),
                0,
              ),
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ==================== VIEW 2: Ticket -> Ky ====================
function View2({
  kqList,
  kyList,
  tickets,
  trx,
}: {
  kqList: KenoTrxKq[];
  kyList: string[];
  tickets: string[];
  trx: KenoTrx;
}) {
  const ticketKyMap: Record<string, Record<string, KenoTrxKq>> = {};
  for (const r of kqList) {
    const t = r.ticket.trim();
    const ky = r.ky.trim();
    if (!ticketKyMap[t]) ticketKyMap[t] = {};
    ticketKyMap[t][ky] = r;
  }

  const tongThuong = kqList.reduce((s, r) => s + (r.thuong || 0), 0);

  return (
    <table className="border-collapse text-xs w-full bg-white shadow rounded-lg overflow-hidden">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-3 py-2 border border-gray-300 text-center w-16">
            Ticket
          </th>
          <th className="px-3 py-2 border border-gray-300 text-center w-28">
            Kỳ
          </th>
          <th className="px-3 py-2 border border-gray-300 text-center">
            Số trúng
          </th>
          <th className="px-3 py-2 border border-gray-300 text-center w-12">
            CNT
          </th>
          <th className="px-3 py-2 border border-gray-300 text-center w-24">
            Thưởng
          </th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((t) => {
          const kyData = ticketKyMap[t] || {};
          const tongThuongTicket = Object.values(kyData).reduce(
            (s, r) => s + (r.thuong || 0),
            0,
          );

          return (
            <>
              {/* Dong ticket - highlight vang */}
              <tr key={`${t}-header`} className="bg-yellow-100">
                <td className="px-3 py-1.5 border border-gray-200 font-bold text-blue-700">
                  {t}
                </td>
                <td className="px-3 py-1.5 border border-gray-200"></td>
                <td className="px-3 py-1.5 border border-gray-200"></td>
                <td className="px-3 py-1.5 border border-gray-200"></td>
                <td className="px-3 py-1.5 border border-gray-200 text-right font-bold text-green-600">
                  {tongThuongTicket > 0 ? fmtMoney(tongThuongTicket) : ""}
                </td>
              </tr>

              {/* Dong tung ky */}
              {kyList.map((ky) => {
                const kq = kyData[ky];
                return (
                  <tr
                    key={`${t}-${ky}`}
                    className={`hover:bg-blue-50 ${(kq?.thuong || 0) > 0 ? "bg-green-50" : ""}`}
                  >
                    <td className="px-3 py-1.5 border border-gray-200"></td>
                    <td className="px-3 py-1.5 border border-gray-200 font-mono text-gray-600">
                      ({kyList.indexOf(ky) + 1}) {ky}
                    </td>
                    <td className="px-3 py-1.5 border border-gray-200">
                      <SoTrungHighlight
                        soChon={kq?.so_chon ?? null}
                        soTrung={kq?.so_trung ?? null}
                      />
                    </td>
                    <td className="px-3 py-1.5 border border-gray-200 text-center font-bold">
                      <span
                        className={
                          (kq?.so_cnt || 0) > 0
                            ? "text-green-600"
                            : "text-gray-300"
                        }
                      >
                        {kq?.so_cnt ?? "-"}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 border border-gray-200 text-right">
                      <span
                        className={
                          (kq?.thuong || 0) > 0
                            ? "text-green-600 font-bold"
                            : "text-gray-300"
                        }
                      >
                        {fmtMoney(kq?.thuong ?? null)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </>
          );
        })}

        {/* Tong */}
        <tr className="bg-gray-100 font-bold">
          <td
            colSpan={4}
            className="px-3 py-2 border border-gray-300 text-right"
          >
            Tổng:
          </td>
          <td className="px-3 py-2 border border-gray-300 text-right text-green-600 text-base">
            {fmtMoney(tongThuong)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

// ==================== MAIN ====================
export default async function KenoTrxKqPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { id } = await params;
  const { view = "1" } = await searchParams;

  const [trx, kqList] = await Promise.all([
    fetchKenoTrxById(id),
    fetchKenoTrxKq(id),
  ]);

  if (!trx) notFound();

  const kyMap: Record<string, KenoTrxKq[]> = {};
  for (const kq of kqList) {
    const ky = kq.ky.trim();
    if (!kyMap[ky]) kyMap[ky] = [];
    kyMap[ky].push(kq);
  }
  const kyList = Object.keys(kyMap).sort();
  const tongThuong = kqList.reduce((s, r) => s + (r.thuong || 0), 0);
  const tickets = ["A", "B", "C", "D", "E", "F"].filter(
    (t) => trx[`so_chon_${t.toLowerCase()}` as keyof KenoTrx],
  );

  const doKq = doKenoTrxKq.bind(null, id);

  return (
    <div className="min-h-screen bg-gray-50 font-mono p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Link
              href="/keno/trx"
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ← Danh sách
            </Link>
            <h1 className="text-lg font-bold text-blue-800">
              🎯 Kết quả vé {id}
            </h1>
          </div>
          <form action={doKq}>
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              🔄 Dò lại KQ
            </button>
          </form>
        </div>

        {/* Thong tin ve - bo Tickets */}
        <div className="bg-white rounded-lg shadow p-3 mb-4 flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-gray-500">ID:</span> <strong>{id}</strong>
          </div>
          <div>
            <span className="text-gray-500">Từ kỳ:</span>{" "}
            <strong className="font-mono">{trx.tu_ky?.trim()}</strong>
          </div>
          <div>
            <span className="text-gray-500">Số kỳ:</span>{" "}
            <strong>{trx.so_ky}</strong>
          </div>
          <div className="ml-auto">
            <span className="text-gray-500">Tổng thưởng:</span>{" "}
            <strong
              className={`text-lg ${tongThuong > 0 ? "text-green-600" : "text-gray-400"}`}
            >
              {fmtMoney(tongThuong)}
            </strong>
          </div>
        </div>

        {/* Toggle view */}
        <div className="flex items-center gap-1 border border-gray-300 rounded overflow-hidden text-xs mb-4 w-fit">
          <Link
            href={`/keno/trx/${id}/kq?view=1`}
            className={`px-3 py-1.5 ${view === "1" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            Kỳ → Ticket
          </Link>
          <Link
            href={`/keno/trx/${id}/kq?view=2`}
            className={`px-3 py-1.5 ${view === "2" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            Ticket → Kỳ
          </Link>
        </div>

        {/* Ket qua */}
        {kqList.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
            Chưa có kết quả. Nhấn "Dò lại KQ" để kiểm tra.
          </div>
        ) : view === "1" ? (
          <div className="overflow-auto">
            <View1 kyMap={kyMap} kyList={kyList} tickets={tickets} />
          </div>
        ) : (
          <div className="overflow-auto">
            <View2
              kqList={kqList}
              kyList={kyList}
              tickets={tickets}
              trx={trx}
            />
          </div>
        )}
      </div>
    </div>
  );
}
