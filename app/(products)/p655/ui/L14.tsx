import { LastJPRow, JpDdRow } from '@/app/lib/p655/dashboard_data';

const DEC_COLORS: Record<number,string> = {
  0:'bg-red-400 text-white',    1:'bg-orange-400 text-white',
  2:'bg-yellow-400 text-black', 3:'bg-green-500 text-white',
  4:'bg-blue-500 text-white',   5:'bg-purple-500 text-white',
};
function numBg(n:number){ return DEC_COLORS[Math.floor(n/10)]??'bg-gray-200 text-black'; }
function fmtDate(d:string){ if(!d)return''; const dt=new Date(d); return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`; }

function NumBadge({n,extraBg}:{n:number;extraBg?:string}){
  if(!n) return <span className="w-7 h-6 inline-flex items-center justify-center text-xs text-gray-300">-</span>;
  return <span className={`w-7 h-6 inline-flex items-center justify-center text-xs rounded font-bold ${extraBg??numBg(n)}`}>{String(n).padStart(2,'0')}</span>;
}

function Th({children,className='',colSpan}:{children:React.ReactNode;className?:string;colSpan?:number}){
  return <th colSpan={colSpan} className={`px-2 py-1 text-center text-xs font-semibold border border-gray-300 whitespace-nowrap ${className}`}>{children}</th>;
}
function Td({children,className='',colSpan}:{children:React.ReactNode;className?:string;colSpan?:number}){
  return <td colSpan={colSpan} className={`px-2 py-0.5 text-xs border border-gray-200 whitespace-nowrap ${className}`}>{children}</td>;
}

const LOAI_COLORS: Record<string,string> = {
  Power:'bg-purple-100 text-purple-800',
  Mega:'bg-blue-100 text-blue-800',
  Lotto:'bg-green-100 text-green-800',
};
const LOAI_MAP: Record<string,string> = { PW:'Power', MG:'Mega', LO:'Lotto' };

interface Props {
  lastJP: LastJPRow[];
  jpDd: { ddKeTiep:number; thuKeTiep:string; ngayKeTiep:string; fullKy:JpDdRow[]; last128:JpDdRow[] } | null;
}

export default function L14Panel({ lastJP, jpDd }: Props) {
  const COLS = ['Loại','Thứ','Ngày','Kỳ','N1','N2','N3','N4','N5','N6','N7'];

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded p-2 overflow-x-auto">
      <div className="text-xs font-bold text-gray-700 mb-1">L14</div>
      <table className="border-collapse text-xs w-full">
        <thead>
          <tr className="bg-gray-100">
            {COLS.map(h=><Th key={h}>{h}</Th>)}
          </tr>
        </thead>
        <tbody>
          {/* ---- Jackpot ---- */}
          <tr className="bg-yellow-100">
            <Td colSpan={11} className="font-bold text-yellow-900">Jackpot</Td>
          </tr>
          {lastJP.map(row=>(
            <tr key={row.loai} className="hover:bg-yellow-50 bg-yellow-50/30">
              <Td><span className={`px-1.5 py-0.5 rounded text-xs font-bold ${LOAI_COLORS[LOAI_MAP[row.loai]]}`}>{LOAI_MAP[row.loai]}</span></Td>
              <Td className="text-center">{row.thu}</Td>
              <Td className="text-center">{fmtDate(row.ngay)}</Td>
              <Td className="text-center font-mono font-bold">{row.ky}</Td>
              {[row.n1,row.n2,row.n3,row.n4,row.n5,row.n6].map((n,i)=>(
                <Td key={i} className="text-center"><NumBadge n={n}/></Td>
              ))}
              <Td className="text-center">{row.n7?<NumBadge n={row.n7} extraBg="bg-yellow-300 text-black"/>:<span className="text-gray-300">-</span>}</Td>
            </tr>
          ))}

          {/* ---- Ngay dd Jackpot ---- */}
          {jpDd && <>
            <tr className="bg-cyan-400">
              <td colSpan={11} className="px-2 py-0.5 text-xs font-bold text-cyan-900">
                Ngày dd Jackpot — Kỳ tới: <span className="font-mono">{jpDd.thuKeTiep} {jpDd.ngayKeTiep}</span> (dd={jpDd.ddKeTiep})
              </td>
            </tr>
            {jpDd.fullKy.length===0
              ? <tr><Td colSpan={11} className="text-gray-400 italic text-center">Không có kỳ JP nào cùng dd</Td></tr>
              : jpDd.fullKy.map(row=>(
                <tr key={row.ky} className="hover:bg-cyan-50">
                  <Td><span className={`px-1.5 py-0.5 rounded text-xs font-bold ${LOAI_COLORS['Power']}`}>Power</span></Td>
                  <Td className="text-center">{row.thu}</Td>
                  <Td className="text-center">{fmtDate(row.ngay)}</Td>
                  <Td className="text-center font-mono font-bold text-orange-700">{row.ky}</Td>
                  {[row.n1,row.n2,row.n3,row.n4,row.n5,row.n6].map((n,i)=>(
                    <Td key={i} className="text-center"><NumBadge n={n}/></Td>
                  ))}
                  <Td></Td>
                </tr>
              ))
            }

            {/* ---- Ngay dd 128 ky ---- */}
            <tr className="bg-yellow-100">
              <td colSpan={11} className="px-2 py-0.5 text-xs font-bold text-yellow-900">
                Ngày dd — 128 kỳ gần (dd={jpDd.ddKeTiep})
              </td>
            </tr>
            {jpDd.last128.length===0
              ? <tr><Td colSpan={11} className="text-gray-400 italic text-center">Không có</Td></tr>
              : jpDd.last128.map(row=>(
                <tr key={row.ky} className="hover:bg-yellow-50 bg-yellow-50/30">
                  <Td><span className={`px-1.5 py-0.5 rounded text-xs font-bold ${LOAI_COLORS['Power']}`}>Power</span></Td>
                  <Td className="text-center">{row.thu}</Td>
                  <Td className="text-center">{fmtDate(row.ngay)}</Td>
                  <Td className="text-center font-mono font-bold text-blue-700">{row.ky}</Td>
                  {[row.n1,row.n2,row.n3,row.n4,row.n5,row.n6].map((n,i)=>(
                    <Td key={i} className="text-center"><NumBadge n={n}/></Td>
                  ))}
                  <Td></Td>
                </tr>
              ))
            }
          </>}
        </tbody>
      </table>
    </div>
  );
}
