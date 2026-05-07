import { LastJPRow, JpDdRow } from '@/app/lib/p655/dashboard_data';
import { P655Row } from '@/app/lib/p655/definitions';

// ==================== COLORS ====================
const DEC_COLORS: Record<number,string> = {
  0:'bg-red-400 text-white',    1:'bg-orange-400 text-white',
  2:'bg-yellow-400 text-black', 3:'bg-green-500 text-white',
  4:'bg-blue-500 text-white',   5:'bg-purple-500 text-white',
};
const THU_COLORS: Record<string,string> = {
  T3:'bg-blue-500 text-white', T5:'bg-purple-500 text-white', T7:'bg-orange-500 text-white',
};
const LOAI_COLORS: Record<string,string> = {
  Power:'bg-purple-100 text-purple-800', Mega:'bg-blue-100 text-blue-800', Lotto:'bg-green-100 text-green-800',
};
const LOAI_MAP: Record<string,string> = { PW:'Power', MG:'Mega', LO:'Lotto' };
const BG_COT = 'bg-yellow-100';

function numBg(n:number){ return DEC_COLORS[Math.floor(n/10)]??'bg-gray-200 text-black'; }
function fmtDate(d:string){ if(!d)return''; const dt=new Date(d); return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`; }

function NumBadge({n,extraBg}:{n:number;extraBg?:string}){
  if(!n) return <span className="w-7 h-6 inline-flex items-center justify-center text-xs text-gray-300">-</span>;
  return <span className={`w-7 h-6 inline-flex items-center justify-center text-xs rounded font-bold ${extraBg??numBg(n)}`}>{String(n).padStart(2,'0')}</span>;
}
function Th({children,className='',colSpan,rowSpan}:{children:React.ReactNode;className?:string;colSpan?:number;rowSpan?:number}){
  return <th colSpan={colSpan} rowSpan={rowSpan} className={`px-1 py-1 text-center text-xs font-semibold border border-gray-300 whitespace-nowrap ${className}`}>{children}</th>;
}
function Td({children,className='',colSpan}:{children:React.ReactNode;className?:string;colSpan?:number}){
  return <td colSpan={colSpan} className={`px-1 py-0.5 text-center text-xs border border-gray-200 whitespace-nowrap ${className}`}>{children}</td>;
}

// MEGA cols = Trung + N1..N6 = 7
// POWER cols = # + Thu + Ngay + Ky + N1..N6 + N7 = 11

interface Props {
  lastJP: LastJPRow[];
  jpDd: { ddKeTiep:number; thuKeTiep:string; ngayKeTiep:string; fullKy:JpDdRow[]; last128:JpDdRow[] } | null;
  kqData: P655Row[];
}

export default function L7Combined({ lastJP, jpDd, kqData }: Props) {
  return (
    <div className="flex-1 overflow-x-auto">
      <table className="border-collapse text-xs w-full min-w-max">
        <thead className="sticky top-0 z-10">
          {/* Row 1: L14 header | L5 header */}
          <tr>
            <Th colSpan={7} className="bg-blue-200 text-blue-900">L14 — Mega</Th>
            <Th colSpan={11} className="bg-purple-100 text-purple-900">L5 — Input TRX / Power</Th>
          </tr>
          {/* Row 2: L14 sub-header | L5 sub-header */}
          <tr className="bg-gray-100">
            {/* Mega cols */}
            <Th className="bg-blue-100">Trùng</Th>
            {[1,2,3,4,5,6].map(i=><Th key={i} className="bg-blue-50">N{i}</Th>)}
            {/* Power cols */}
            <Th className="bg-gray-200">#</Th>
            <Th className="bg-gray-200">Thứ</Th>
            <Th className="bg-gray-200">Ngày</Th>
            <Th className={BG_COT}>Kỳ</Th>
            {[1,2,3,4,5,6].map(i=><Th key={i} className="bg-blue-50">N{i}</Th>)}
            <Th className="bg-yellow-100">N7</Th>
          </tr>
        </thead>
        <tbody>
          {/* ===== L14 SECTION ===== */}
          {/* Jackpot header */}
          <tr className="bg-yellow-100">
            <td colSpan={18} className="px-2 py-0.5 text-xs font-bold text-yellow-900 border border-gray-200">Jackpot</td>
          </tr>
          {lastJP.map(row=>(
            <tr key={row.loai} className="bg-yellow-50/50 hover:bg-yellow-50">
              {/* Mega side: empty for L14 JP rows */}
              <Td colSpan={7} className="text-left px-2">
                <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${LOAI_COLORS[LOAI_MAP[row.loai]]}`}>{LOAI_MAP[row.loai]}</span>
                <span className="ml-2 text-gray-500">{row.thu}</span>
                <span className="ml-2 text-gray-600">{fmtDate(row.ngay)}</span>
                <span className="ml-2 font-mono font-bold">{row.ky}</span>
                <span className="ml-2 flex inline-flex gap-0.5">
                  {[row.n1,row.n2,row.n3,row.n4,row.n5,row.n6].map((n,i)=><NumBadge key={i} n={n}/>)}
                  {row.n7 ? <NumBadge n={row.n7} extraBg="bg-yellow-300 text-black"/> : null}
                </span>
              </Td>
              {/* Power side: L5 input headers (empty data rows) */}
              <Td colSpan={11}></Td>
            </tr>
          ))}

          {/* Ngay dd JP header */}
          {jpDd && <>
            <tr className="bg-cyan-400">
              <td colSpan={7} className="px-2 py-0.5 text-xs font-bold text-cyan-900 border border-gray-200">
                Ngày dd JP — {jpDd.thuKeTiep} {jpDd.ngayKeTiep} (dd={jpDd.ddKeTiep})
              </td>
              {/* L5 Input header row 1 */}
              <td colSpan={11} className="px-1 py-0.5 border border-gray-200 bg-purple-50">
                <span className="text-xs font-bold text-purple-800">L5 - Input TRX</span>
              </td>
            </tr>
            {/* Ngay dd JP rows + L5 input rows side by side */}
            {Array.from({length: Math.max(jpDd.fullKy.length||1, 6)}).map((_,i)=>{
              const jpRow = jpDd.fullKy[i];
              const vLabel = i < 6 ? `v${i+1}` : '';
              return (
                <tr key={`jpdd-${i}`} className="hover:bg-cyan-50">
                  {/* Mega side: JP dd row */}
                  {jpRow ? <>
                    <Td className="text-left px-1" colSpan={7}>
                      <span className={`px-1 py-0.5 rounded text-xs font-bold ${LOAI_COLORS['Power']}`}>Power</span>
                      <span className="ml-1 text-gray-500">{jpRow.thu}</span>
                      <span className="ml-1 font-mono font-bold text-orange-700">{jpRow.ky}</span>
                      <span className="ml-1 inline-flex gap-0.5">
                        {[jpRow.n1,jpRow.n2,jpRow.n3,jpRow.n4,jpRow.n5,jpRow.n6].map((n,j)=><NumBadge key={j} n={n}/>)}
                      </span>
                    </Td>
                  </> : <Td colSpan={7}></Td>}
                  {/* Power side: L5 input */}
                  {vLabel ? <>
                    <Td className="bg-yellow-50 font-bold text-gray-600">{vLabel}</Td>
                    {[1,2,3,4,5,6].map(j=>(
                      <td key={j} className="px-0.5 py-0.5 border border-gray-200 bg-purple-50/30">
                        <input type="number" min={1} max={55}
                          className="w-10 text-center text-xs border-0 bg-transparent focus:outline-none focus:bg-blue-50 rounded"/>
                      </td>
                    ))}
                    <Td className="bg-purple-50/30" colSpan={4}></Td>
                  </> : <Td colSpan={11}></Td>}
                </tr>
              );
            })}

            {/* Ngay dd 128 ky header */}
            <tr className="bg-yellow-100">
              <td colSpan={7} className="px-2 py-0.5 text-xs font-bold text-yellow-900 border border-gray-200">
                Ngày dd 128 kỳ (dd={jpDd.ddKeTiep})
              </td>
              <td colSpan={11} className="border border-gray-200"></td>
            </tr>
            {jpDd.last128.map(row=>(
              <tr key={row.ky} className="hover:bg-yellow-50 bg-yellow-50/30">
                <Td className="text-left px-1" colSpan={7}>
                  <span className={`px-1 py-0.5 rounded text-xs font-bold ${LOAI_COLORS['Power']}`}>Power</span>
                  <span className="ml-1 text-gray-500">{row.thu}</span>
                  <span className="ml-1 font-mono font-bold text-blue-700">{row.ky}</span>
                  <span className="ml-1 inline-flex gap-0.5">
                    {[row.n1,row.n2,row.n3,row.n4,row.n5,row.n6].map((n,i)=><NumBadge key={i} n={n}/>)}
                  </span>
                </Td>
                <Td colSpan={11}></Td>
              </tr>
            ))}
          </>}

          {/* ===== L7 KET QUA ===== */}
          <tr className="bg-cyan-100">
            <td colSpan={18} className="px-2 py-0.5 text-xs font-bold text-cyan-900 border border-gray-200">
              L7 - Kết quả Power 655
            </td>
          </tr>
          {kqData.map((row,idx)=>{
            const m=row.mega;
            const ngayBg=(row.jp1_cnt>0&&row.jp2_cnt>0)?'bg-purple-500 text-white font-bold'
              :row.jp1_cnt>0?'bg-red-500 text-white font-bold'
              :row.jp2_cnt>0?'bg-green-500 text-white font-bold':'';
            return (
              <>
                {/* Mega row */}
                <tr key={`m-${row.ky}`} className="bg-blue-50">
                  {m.ky===null
                    ? <><Td className="bg-gray-200 text-gray-400 italic text-xs">MIS</Td><Td colSpan={6} className="bg-gray-200"/></>
                    : <>
                        <Td className={m.trung.length===0?'bg-gray-200 text-gray-400':'text-red-600 font-semibold'}>
                          {m.trung.length>0?m.trung.join(','):''}
                        </Td>
                        {[m.mn1,m.mn2,m.mn3,m.mn4,m.mn5,m.mn6].map((n,i)=>(
                          <Td key={i} className="p-0.5"><NumBadge n={n}/></Td>
                        ))}
                      </>
                  }
                  <Td colSpan={11} className="bg-blue-50"/>
                </tr>
                {/* Power row */}
                <tr key={`p-${row.ky}`} className="hover:bg-blue-50">
                  <Td colSpan={7}/>
                  <Td className="bg-gray-50 text-gray-500">{idx+1}</Td>
                  <Td className={`font-semibold ${THU_COLORS[row.thu]??''}`}>{row.thu}</Td>
                  <Td className={ngayBg}>{fmtDate(row.ngay)}</Td>
                  <Td className={`font-mono font-bold ${BG_COT}`}>{row.ky}</Td>
                  {[row.n1,row.n2,row.n3,row.n4,row.n5,row.n6].map((n,i)=><Td key={i} className="p-0.5"><NumBadge n={n}/></Td>)}
                  <Td className="p-0.5 bg-yellow-100"><NumBadge n={row.n7}/></Td>
                </tr>
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
