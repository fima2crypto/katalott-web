'use client';

import { useState } from 'react';
import { KenoKqRow } from '@/app/lib/kenokq/kenokq_definitions';
import GiaiDialog from '@/app/(products)/keno/ui/GiaiDialog';

// ==================== HELPERS ====================
function fmtDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ==================== COMPONENTS ====================
function NumCell({ n }: { n: number }) {
  if (!n) return <span className="w-6 h-6 inline-flex items-center justify-center text-xs text-gray-300">-</span>;
  const dec = Math.floor(n / 10);
  const colors = [
    'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-cyan-400',
    'bg-blue-600', 'bg-purple-400', 'bg-lime-400', 'bg-sky-400', 'bg-red-400',
  ];
  const bg = n === 80 ? '' : colors[dec] || 'bg-gray-100';
  const style = n === 80 ? { backgroundColor: '#ef4444', color: 'white' } : {};
  return (
    <span className={`w-6 h-6 inline-flex items-center justify-center text-xs rounded font-sans ${bg}`} style={style}>
      {String(n).padStart(2, '0')}
    </span>
  );
}

function CountCell({ val, bgHeader }: { val: number; bgHeader: string }) {
  const bg = val === 0 ? 'bg-gray-200' : val >= 5 ? 'bg-red-500' : bgHeader;
  const color = val === 0 ? 'text-gray-400' : 'text-black';
  return (
    <td className={`px-1 py-0.5 text-center text-xs border border-gray-200 ${bg}`}>
      <span className={color}>{val}</span>
    </td>
  );
}

function Th({ children, className = '', colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <th colSpan={colSpan} className={`px-1 py-1 text-center text-xs font-semibold border border-gray-300 whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <td onClick={onClick} className={`px-1 py-0.5 text-center text-xs border border-gray-200 ${className}`}>
      {children}
    </td>
  );
}

function KenoRow({ row, idx, onKyClick }: { row: KenoKqRow; idx: number; onKyClick: (ky: string) => void }) {
  const kyColor = row.jackpot_red
    ? 'bg-red-500 text-white cursor-pointer hover:bg-red-600'
    : row.jackpot_green
      ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
      : 'text-blue-700 cursor-pointer hover:underline';

  return (
    <tr className="hover:bg-blue-50 transition-colors">
      <Td className="bg-gray-50 text-gray-500">{idx}</Td>
      <Td className="whitespace-nowrap">{fmtDate(row.ngay)} {row.gio}</Td>
      <Td className={`font-mono font-bold ${kyColor}`} onClick={() => onKyClick(row.ky)}>
        {row.ky}
      </Td>

      {row.nums.map((n, i) => (
        <Td key={i} className="p-0.5"><NumCell n={n} /></Td>
      ))}

      {/* G0 */}
      <Td>{row.g0_count > 0 ? row.g0.join(',') : ''}</Td>
      <Td className={`font-bold w-8 min-w-[2rem] ${row.g0_count >= 7 ? 'bg-red-500 text-white' : row.g0_count >= 5 ? 'bg-green-500 text-white' : 'bg-yellow-50'}`}>
        {row.g0_count}
      </Td>

      {/* XX */}
      <Td>{row.xx_count > 0 ? row.xx.join(',') : ''}</Td>
      <Td className={`w-8 min-w-[2rem] ${row.xx_count >= 4 ? 'bg-red-500 text-white' : row.xx_count === 0 ? 'bg-gray-400 text-white' : 'bg-yellow-50'}`}>
        {row.xx_count}
      </Td>

      {/* SNT */}
      <Td>{row.snt_count > 0 ? row.snt.join(',') : ''}</Td>
      <Td className={`font-bold w-8 min-w-[2rem] ${row.snt_count >= 7 ? 'bg-red-500 text-white' : row.snt_count >= 5 ? 'bg-green-500 text-white' : 'bg-yellow-50'}`}>
        {row.snt_count}
      </Td>

      {/* HT0-HT7 */}
      {[0,1,2,3,4,5,6,7].map(i => (
        <CountCell key={`ht${i}`} val={row[`ht${i}` as keyof KenoKqRow] as number} bgHeader="bg-cyan-100" />
      ))}

      {/* VT */}
      {[1,2,3,5,7,9].map(i => (
        <CountCell key={`vt${i}`} val={row[`vt${i}` as keyof KenoKqRow] as number} bgHeader="bg-yellow-100" />
      ))}

      {/* H0-H8 */}
      {[0,1,2,3,4,5,6,7,8].map(i => (
        <CountCell key={`h${i}`} val={row[`h${i}` as keyof KenoKqRow] as number} bgHeader="bg-blue-100" />
      ))}

      {/* V0-V9 */}
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <CountCell key={`v${i}`} val={row[`v${i}` as keyof KenoKqRow] as number} bgHeader="bg-green-100" />
      ))}
    </tr>
  );
}

// ==================== MAIN ====================
export default function KenoKqTable({ data }: { data: KenoKqRow[] }) {
  const [selectedKy, setSelectedKy] = useState<string | null>(null);

  return (
    <>
      {selectedKy && (
        <GiaiDialog ky={selectedKy} onClose={() => setSelectedKy(null)} />
      )}

      <div className="overflow-auto">
        <table className="border-collapse text-xs" style={{ minWidth: 'max-content' }}>
          <thead className="sticky top-0 z-10">
            <tr>
              <Th className="bg-gray-100">STT</Th>
              <Th className="bg-gray-100">Ngày</Th>
              <Th className="bg-gray-100">Kỳ</Th>
              {Array.from({ length: 20 }).map((_, i) => (
                <Th key={i} className="bg-blue-50">N{i + 1}</Th>
              ))}
              <Th colSpan={2} className="bg-red-200">G0</Th>
              <Th colSpan={2} className="bg-blue-400 text-white">XX</Th>
              <Th colSpan={2} className="bg-green-200">SNT</Th>
              {[0,1,2,3,4,5,6,7].map(i => <Th key={i} className="bg-cyan-200">HT{i}</Th>)}
              {[1,2,3,5,7,9].map(n => <Th key={n} className="bg-yellow-200">VT{n}</Th>)}
              {[0,1,2,3,4,5,6,7,8].map(i => <Th key={i} className="bg-blue-200">H{i}</Th>)}
              {[0,1,2,3,4,5,6,7,8,9].map(i => <Th key={i} className="bg-green-200">V{i}</Th>)}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={100} className="text-center py-8 text-gray-400">Không có dữ liệu</td>
              </tr>
            ) : (
              data.map((row, i) => (
                <KenoRow key={row.ky} row={row} idx={i + 1} onKyClick={setSelectedKy} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
