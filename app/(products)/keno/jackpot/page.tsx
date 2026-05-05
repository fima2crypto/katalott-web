'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import GiaiDialog from '@/app/(products)/keno/ui/GiaiDialog';
import { JackpotRow } from '@/app/lib/kenokq/jackpot_data';

function fmtDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

function todayDDMMYYYY() {
  const now = new Date();
  return `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
}

function autoSlash(val: string) {
  let v = val.replace(/\D/g, '');
  if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
  if (v.length > 5) v = v.slice(0,5) + '/' + v.slice(5);
  return v.slice(0,10);
}

function parseDate(ddmmyyyy: string): string {
  if (!ddmmyyyy) return '';
  const parts = ddmmyyyy.split('/');
  if (parts.length === 3 && parts[2].length === 4)
    return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
  return '';
}

function Th({ children, className='', colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <th colSpan={colSpan} className={`px-2 py-1 text-center text-xs font-semibold border border-gray-300 whitespace-nowrap ${className}`}>{children}</th>;
}

function Td({ children, className='', onClick, colSpan }: { children: React.ReactNode; className?: string; onClick?: () => void; colSpan?: number }) {
  return <td colSpan={colSpan} onClick={onClick} className={`px-2 py-1 text-center text-xs border border-gray-200 ${className}`}>{children}</td>;
}

function BacBadge({ bac }: { bac: number }) {
  const isRed = bac >= 8;
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-white text-xs font-bold mx-0.5 ${isRed ? 'bg-red-500' : 'bg-green-500'}`}>
      {bac}
    </span>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      <label className="text-sm text-gray-600 whitespace-nowrap">{label}</label>
      <input type="text" placeholder="dd/mm/yyyy" value={value}
        onChange={e => onChange(autoSlash(e.target.value))}
        className="border border-gray-300 rounded px-2 py-1 text-sm w-28" />
    </div>
  );
}

// ==================== SUMMARY TABLE ====================
function SummaryTable({ data, selectedBac, onSelectBac }: {
  data: JackpotRow[];
  selectedBac: number | null;
  onSelectBac: (bac: number | null) => void;
}) {
  const countMap = new Map<number, number>();
  for (const row of data) {
    for (const bac of row.bac_trung) {
      countMap.set(bac, (countMap.get(bac) ?? 0) + 1);
    }
  }
  const entries = Array.from(countMap.entries()).sort((a, b) => a[0] - b[0]);
  const total = entries.reduce((s, [, cnt]) => s + cnt, 0);

  if (entries.length === 0) return null;

  return (
    <div className="flex-shrink-0">
      <table className="border-collapse text-xs">
        <thead className="sticky top-0 z-10">
          <tr>
            <Th className="bg-gray-100">STT</Th>
            <Th className="bg-gray-100">Bậc Trúng</Th>
            <Th className="bg-gray-100">Số lượng</Th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([bac, cnt], idx) => {
            const isSelected = selectedBac === bac;
            return (
              <tr
                key={bac}
                onClick={() => onSelectBac(isSelected ? null : bac)}
                className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 ring-1 ring-blue-400' : 'hover:bg-blue-50'}`}
              >
                <Td className={`bg-gray-50 text-gray-500 ${isSelected ? '!bg-blue-100' : ''}`}>{idx + 1}</Td>
                <Td><BacBadge bac={bac} /></Td>
                <Td className={`font-bold ${isSelected ? 'text-blue-700' : ''}`}>{cnt}</Td>
              </tr>
            );
          })}
          {/* Tong */}
          <tr
            onClick={() => onSelectBac(null)}
            className={`cursor-pointer transition-colors ${selectedBac === null ? 'bg-blue-100' : 'bg-gray-100 hover:bg-blue-50'}`}
          >
            <Td colSpan={2} className="text-right pr-3 font-bold text-gray-600">Tổng</Td>
            <Td className="font-bold text-blue-700">{total}</Td>
          </tr>
        </tbody>
      </table>
      {selectedBac !== null && (
        <div className="mt-1 text-xs text-blue-600 text-center">
          Đang lọc Bậc {selectedBac} • <span className="underline cursor-pointer" onClick={() => onSelectBac(null)}>Xoá lọc</span>
        </div>
      )}
    </div>
  );
}

// ==================== MAIN ====================
export default function JackpotPage() {
  const [data, setData] = useState<JackpotRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKy, setSelectedKy] = useState<string | null>(null);
  const [selectedBac, setSelectedBac] = useState<number | null>(null);

  const [mode, setMode] = useState<'range' | 'limit'>('limit');
  const [tuNgayInput, setTuNgayInput] = useState(todayDDMMYYYY());
  const [denNgayInput, setDenNgayInput] = useState(todayDDMMYYYY());
  const [limit, setLimit] = useState(200);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedBac(null);
    try {
      const params = new URLSearchParams();
      if (mode === 'range') {
        const tuNgay = parseDate(tuNgayInput);
        const denNgay = parseDate(denNgayInput);
        if (tuNgay) params.set('tu_ngay', tuNgay);
        if (denNgay) params.set('den_ngay', denNgay);
      } else {
        params.set('limit', String(limit));
      }
      const res = await fetch(`/api/keno/jackpot?${params}`);
      if (!res.ok) throw new Error(`Lỗi ${res.status}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [mode, tuNgayInput, denNgayInput, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter data theo bac da chon
  const filteredData = selectedBac === null
    ? data
    : data.filter(row => row.bac_trung.includes(selectedBac));

  return (
    <div className="min-h-screen bg-gray-50 font-mono">
      {selectedKy && <GiaiDialog ky={selectedKy} onClose={() => setSelectedKy(null)} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 flex-wrap">
        <Link href="/keno" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-blue-800">🎯 Jackpot</h1>

        <div className="flex items-center gap-1 border border-gray-300 rounded overflow-hidden text-xs">
          <button onClick={() => setMode('limit')}
            className={`px-3 py-1.5 ${mode === 'limit' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            Số kỳ
          </button>
          <button onClick={() => setMode('range')}
            className={`px-3 py-1.5 ${mode === 'range' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            Khoảng ngày
          </button>
        </div>

        {mode === 'range' && (
          <div className="flex items-center gap-2">
            <DateInput label="Từ:" value={tuNgayInput} onChange={setTuNgayInput} />
            <DateInput label="Đến:" value={denNgayInput} onChange={setDenNgayInput} />
            {(tuNgayInput || denNgayInput) && (
              <button onClick={() => { setTuNgayInput(''); setDenNgayInput(''); }}
                className="text-xs text-red-500 hover:underline">✕ Xoá</button>
            )}
          </div>
        )}

        {mode === 'limit' && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Số kỳ quét:</label>
            <input type="number" min={1} max={2000} value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-24" />
          </div>
        )}

        <div className="text-sm text-gray-500">
          Tổng: <strong>{filteredData.length}</strong>
          {selectedBac !== null && <span className="text-blue-600"> / {data.length} kỳ (Bậc {selectedBac})</span>}
          {selectedBac === null && <span> kỳ</span>}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-green-500 inline-block"></span> B05-B07
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-red-500 inline-block"></span> B08-B10
          </span>
        </div>
      </div>

      {error && <div className="m-4 p-3 bg-red-100 text-red-700 rounded text-sm">⚠️ {error}</div>}

      {/* Body: Summary trai + Main table phai */}
      <div className="flex gap-4 p-4 items-start overflow-auto">

        {/* Summary table ben trai */}
        {!loading && data.length > 0 && (
          <SummaryTable
            data={data}
            selectedBac={selectedBac}
            onSelectBac={setSelectedBac}
          />
        )}

        {/* Main table ben phai */}
        <div className="overflow-auto flex-1">
          <table className="border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr>
                <Th className="bg-gray-100">STT</Th>
                <Th className="bg-gray-100">Ngày Giờ</Th>
                <Th className="bg-gray-100">Kỳ</Th>
                <Th className="bg-gray-100">
                  Bậc Trúng
                  {selectedBac !== null && (
                    <span className="ml-1 text-blue-600">(Bậc {selectedBac})</span>
                  )}
                </Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">⏳ Đang tải...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">Không có dữ liệu</td></tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr key={row.ky} className="hover:bg-blue-50 transition-colors">
                    <Td className="bg-gray-50 text-gray-500">{idx + 1}</Td>
                    <Td className="whitespace-nowrap">{fmtDate(row.ngay)} {row.gio}</Td>
                    <Td
                      className={`font-mono font-bold cursor-pointer hover:underline
                        ${row.jackpot_red ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                      onClick={() => setSelectedKy(row.ky)}
                    >
                      {row.ky}
                    </Td>
                    <Td>
                      <div className="flex items-center justify-center flex-wrap gap-0.5">
                        {row.bac_trung.map(bac => (
                          <BacBadge key={bac} bac={bac} />
                        ))}
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 