"use client";

import { useState } from "react";
import { P655Row } from "@/app/lib/p655/definitions";
import { LastJPRow, JpDdRow } from "@/app/lib/p655/dashboard_data";

// ==================== COLORS ====================
const DEC_COLORS: Record<number,string> = {
  0:'bg-red-400 text-white',1:'bg-orange-400 text-white',
  2:'bg-yellow-400 text-black',3:'bg-green-500 text-white',
  4:'bg-blue-500 text-white',5:'bg-purple-500 text-white',
};
const THU_COLORS: Record<string,string> = {
  T3:'bg-blue-500 text-white',T5:'bg-purple-500 text-white',T7:'bg-orange-500 text-white',
};
const DD_COLORS: Record<string,string> = {
  CC:'bg-green-600 text-white',CL:'bg-yellow-400 text-black',
  LC:'bg-cyan-400 text-black',LL:'bg-lime-400 text-black',
};
const LOAI_COLORS: Record<string,string> = {
  Power:'bg-purple-100 text-purple-800',Mega:'bg-blue-100 text-blue-800',Lotto:'bg-green-100 text-green-800',
};
const LOAI_MAP: Record<string,string> = {PW:'Power',MG:'Mega',LO:'Lotto'};
const BG_COT='bg-yellow-100';

function numBg(n:number){ return DEC_COLORS[Math.floor(n/10)]??'bg-gray-200 text-black'; }
function fmtDate(d:string){ if(!d)return''; const dt=new Date(d); return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`; }
function fmtAmt(amt:number|null){ if(!amt)return''; if(amt>=1e9)return`${(amt/1e9).toFixed(1)}B`; if(amt>=1e6)return`${(amt/1e6).toFixed(0)}M`; return amt.toLocaleString(); }

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
function DecCell({val}:{val:number}){
  if(val===0) return <td className="px-1 py-0.5 text-center text-xs border border-gray-200 bg-gray-200 text-gray-400">0</td>;
  return <td className={`px-1 py-0.5 text-center text-xs border border-gray-200 ${val>=3?'bg-amber-700 text-white':'text-black'}`}>{val}</td>;
}

// MEGA cols: Trung(1) + N1-N6(6) = 7
// POWER basic cols: #(1)+Thu(1)+Ngay(1)+Ky(1)+N1-N6(6)+N7(1) = 11
// L5 cols: Ve(1) + N1-N6(6) = 7, Ve aligns with Ky = offset 3 from Power start

interface Props {
  lastJP: LastJPRow[];
  jpDd: {ddKeTiep:number;thuKeTiep:string;ngayKeTiep:string;fullKy:JpDdRow[];last128:JpDdRow[]} | null;
  kqData: P655Row[];
  qhKy?: number;
}

export default function DashboardRight({ lastJP=[], jpDd=null, kqData=[], qhKy=20 }: Props) {
  const [advance, setAdvance] = useState(false);

  // Advance cols count
  const advCols = advance ? 22 : 0; // 0x-5x(6)+DD+SC+CAM+SNT(2)+XX+KE+T1+G0+P1+MOD+SUM+JPP+>QH+QHL+QHC+JP1CK+JP1Amt+JP2Amt = 22... then Level(2)+6CL(2)+JPMatch(2)=6 more
  const advColsTotal = advance ? 28 : 0;

  const megaCols = 7;
  const powerBasic = 11; // # Thu Ngay Ky N1-N6 N7

  return (
    <div className="flex-1 overflow-x-auto">
      <table className="border-collapse text-xs min-w-max">
        {/* ===== L14 + L5 header area ===== */}
        <thead>
          {/* Row 1: L14 label | L5 label */}
          <tr>
            <td colSpan={megaCols} className="px-2 py-1 text-xs font-bold text-gray-700 bg-green-50 border border-green-200">
              L14
            </td>
            {/* L5: Ve col aligns with Ky (col index 3 of power = offset 3) */}
            {/* Power cols: # Thu Ngay = 3 cols before Ky */}
            <td colSpan={3} className="border-0 bg-gray-50"/>
            <td className="px-2 py-1 text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200 whitespace-nowrap">
              L5 - Input TRX
            </td>
            {/* N1-N6 inputs */}
            {[1,2,3,4,5,6].map(i=>(
              <td key={i} className="px-0.5 py-0.5 bg-purple-50 border border-purple-200 text-center">
                <span className="text-xs text-gray-500">N{i}</span>
              </td>
            ))}
            <td className="bg-gray-50 border-0" colSpan={1+advColsTotal}/>
          </tr>
          {/* Row 2: L14 sub + L5 rows v1-v6 merged with L14 rows */}
          {/* Mega + Power column headers */}
          <tr className="bg-gray-100">
            {/* Mega */}
            <Th className="bg-blue-200">Trùng</Th>
            {[1,2,3,4,5,6].map(i=><Th key={i} className="bg-blue-100">N{i}</Th>)}
            {/* Power basic */}
            <Th className="bg-gray-200">#</Th>
            <Th className="bg-gray-200">Thứ</Th>
            <Th className="bg-gray-200">Ngày</Th>
            <Th className={BG_COT}>Kỳ</Th>
            {[1,2,3,4,5,6].map(i=><Th key={i} className="bg-blue-50">N{i}</Th>)}
            <Th className="bg-yellow-100">N7</Th>
            {/* Power advance */}
            {advance && <>
              {[0,1,2,3,4,5].map(i=><Th key={i} className="bg-orange-50">{i}x</Th>)}
              <Th className="bg-cyan-100">DD</Th>
              <Th className="bg-gray-100">SC</Th>
              <Th className={BG_COT}>CAM</Th>
              <Th colSpan={2} className="bg-green-100">SNT</Th>
              <Th className="bg-gray-100">XX</Th>
              <Th className="bg-gray-100">KE</Th>
              <Th className="bg-gray-100">T1</Th>
              <Th className={BG_COT}>G0</Th>
              <Th className="bg-gray-100">P1</Th>
              <Th className={BG_COT}>MOD</Th>
              <Th className="bg-gray-100">SUM</Th>
              <Th className="bg-pink-100">JPP</Th>
              <Th className="bg-red-100">&gt;{qhKy}</Th>
              <Th className="bg-gray-50">QHL</Th>
              <Th className={BG_COT}>QHC</Th>
              <Th className="bg-red-50">JP1CK</Th>
              <Th className="bg-red-50">JP1Amt</Th>
              <Th className="bg-green-50">JP2Amt</Th>
              <Th colSpan={2} className="bg-indigo-100">Level</Th>
              <Th colSpan={2} className="bg-teal-100">6CL</Th>
              <Th colSpan={2} className="bg-violet-100">JPMatch</Th>
            </>}
            {/* Advance button in Power header */}
            <Th className="bg-gray-50">
              <button onClick={()=>setAdvance(a=>!a)}
                className={`px-2 py-0.5 text-xs rounded font-medium ${advance?'bg-indigo-600 text-white':'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}>
                {advance?'◀':'▶'} Adv
              </button>
            </Th>
          </tr>
        </thead>

        <tbody>
          {/* ===== L14 SECTION ===== */}
          {/* Jackpot */}
          <tr className="bg-yellow-100">
            <td colSpan={megaCols} className="px-2 py-0.5 text-xs font-bold text-yellow-900 border border-gray-200">Jackpot</td>
            {/* L5 v1 input row */}
            <td className="border border-gray-200 bg-gray-50" colSpan={3}/>
            <td className="px-1 py-0.5 border border-gray-200 bg-yellow-50 font-bold text-gray-600 text-xs text-center">v1</td>
            {[1,2,3,4,5,6].map(i=>(
              <td key={i} className="px-0.5 py-0.5 border border-gray-200 bg-purple-50/30">
                <input type="number" min={1} max={55} className="w-10 text-center text-xs border-0 bg-transparent focus:outline-none focus:bg-blue-50 rounded"/>
              </td>
            ))}
            <td className="border-0" colSpan={1+advColsTotal}/>
          </tr>
          {lastJP.map((row,ri)=>{
            const vLabel = ri+1 < 6 ? `v${ri+2}` : '';
            return (
              <tr key={row.loai} className="bg-yellow-50/40 hover:bg-yellow-50">
                <Td colSpan={megaCols} className="text-left px-1">
                  <span className={`px-1 py-0.5 rounded text-xs font-bold ${LOAI_COLORS[LOAI_MAP[row.loai]]}`}>{LOAI_MAP[row.loai]}</span>
                  <span className="ml-1 text-gray-500">{row.thu}</span>
                  <span className="ml-1 text-gray-600">{fmtDate(row.ngay)}</span>
                  <span className="ml-1 font-mono font-bold">{row.ky}</span>
                  <span className="ml-1 inline-flex gap-0.5">
                    {[row.n1,row.n2,row.n3,row.n4,row.n5,row.n6].map((n,i)=><NumBadge key={i} n={n}/>)}
                    {row.n7?<NumBadge n={row.n7} extraBg="bg-yellow-300 text-black"/>:null}
                  </span>
                </Td>
                <td className="border border-gray-200 bg-gray-50" colSpan={3}/>
                {vLabel
                  ? <>
                      <td className="px-1 py-0.5 border border-gray-200 bg-yellow-50 font-bold text-gray-600 text-xs text-center">{vLabel}</td>
                      {[1,2,3,4,5,6].map(i=>(
                        <td key={i} className="px-0.5 py-0.5 border border-gray-200 bg-purple-50/30">
                          <input type="number" min={1} max={55} className="w-10 text-center text-xs border-0 bg-transparent focus:outline-none focus:bg-blue-50 rounded"/>
                        </td>
                      ))}
                    </>
                  : <td colSpan={7} className="border border-gray-200 bg-gray-50"/>
                }
                <td className="border-0" colSpan={1+advColsTotal}/>
              </tr>
            );
          })}

          {/* Ngay dd JP */}
          {jpDd && <>
            <tr className="bg-cyan-400">
              <td colSpan={megaCols} className="px-2 py-0.5 text-xs font-bold border border-gray-200">
                Ngày dd JP — {jpDd.thuKeTiep} {jpDd.ngayKeTiep} (dd={jpDd.ddKeTiep})
              </td>
              <td colSpan={powerBasic+advColsTotal+1} className="border border-gray-200"/>
            </tr>
            {jpDd.fullKy.map(row=>(
              <tr key={`fk-${row.ky}`} className="hover:bg-cyan-50">
                <Td colSpan={megaCols} className="text-left px-1">
                  <span className={`px-1 py-0.5 rounded text-xs font-bold ${LOAI_COLORS['Power']}`}>Power</span>
                  <span className="ml-1 text-gray-500">{row.thu}</span>
                  <span className="ml-1 font-mono font-bold text-orange-700">{row.ky}</span>
                  <span className="ml-1 inline-flex gap-0.5">
                    {[row.n1,row.n2,row.n3,row.n4,row.n5,row.n6].map((n,i)=><NumBadge key={i} n={n}/>)}
                  </span>
                </Td>
                <Td colSpan={powerBasic+advColsTotal+1}/>
              </tr>
            ))}
            <tr className="bg-yellow-100">
              <td colSpan={megaCols} className="px-2 py-0.5 text-xs font-bold text-yellow-900 border border-gray-200">
                Ngày dd 128 kỳ (dd={jpDd.ddKeTiep})
              </td>
              <td colSpan={powerBasic+advColsTotal+1} className="border border-gray-200"/>
            </tr>
            {jpDd.last128.map(row=>(
              <tr key={`l128-${row.ky}`} className="hover:bg-yellow-50 bg-yellow-50/30">
                <Td colSpan={megaCols} className="text-left px-1">
                  <span className={`px-1 py-0.5 rounded text-xs font-bold ${LOAI_COLORS['Power']}`}>Power</span>
                  <span className="ml-1 text-gray-500">{row.thu}</span>
                  <span className="ml-1 font-mono font-bold text-blue-700">{row.ky}</span>
                  <span className="ml-1 inline-flex gap-0.5">
                    {[row.n1,row.n2,row.n3,row.n4,row.n5,row.n6].map((n,i)=><NumBadge key={i} n={n}/>)}
                  </span>
                </Td>
                <Td colSpan={powerBasic+advColsTotal+1}/>
              </tr>
            ))}
          </>}

          {/* ===== L7 KET QUA: Mega + Power same row ===== */}
          <tr className="bg-cyan-100">
            <td colSpan={megaCols} className="px-2 py-0.5 text-xs font-bold text-blue-800 border border-gray-200">Mega</td>
            <td colSpan={powerBasic+advColsTotal} className="px-2 py-0.5 text-xs font-bold text-cyan-900 border border-gray-200">Power</td>
            <td className="border border-gray-200"/>
          </tr>
          {kqData.map((row,idx)=>{
            const m=row.mega;
            const ngayBg=(row.jp1_cnt>0&&row.jp2_cnt>0)?'bg-purple-500 text-white font-bold'
              :row.jp1_cnt>0?'bg-red-500 text-white font-bold'
              :row.jp2_cnt>0?'bg-green-500 text-white font-bold':'';
            const jppBg=row.jpp===null?'text-gray-300'
              :row.jpp<=5?'bg-green-100 text-green-800'
              :row.jpp<=15?'bg-yellow-100 text-yellow-800'
              :row.jpp<=30?'bg-orange-200 text-orange-900'
              :'bg-red-300 text-red-900';

            return (
              <tr key={row.ky} className="hover:bg-blue-50">
                {/* Mega cells */}
                {m.ky===null
                  ? <><Td className="bg-gray-200 text-gray-400 italic">MIS</Td><Td colSpan={6} className="bg-gray-200"/></>
                  : <>
                      <Td className={m.trung.length===0?'bg-gray-200 text-gray-400':'text-red-600 font-semibold'}>
                        {m.trung.length>0?m.trung.join(','):''}
                      </Td>
                      {[m.mn1,m.mn2,m.mn3,m.mn4,m.mn5,m.mn6].map((n,i)=><Td key={i} className="p-0.5"><NumBadge n={n}/></Td>)}
                    </>
                }
                {/* Power basic cells */}
                <Td className="bg-gray-50 text-gray-500">{idx+1}</Td>
                <Td className={`font-semibold ${THU_COLORS[row.thu]??''}`}>{row.thu}</Td>
                <Td className={ngayBg}>{fmtDate(row.ngay)}</Td>
                <Td className={`font-mono font-bold ${BG_COT}`}>{row.ky}</Td>
                {[row.n1,row.n2,row.n3,row.n4,row.n5,row.n6].map((n,i)=><Td key={i} className="p-0.5"><NumBadge n={n}/></Td>)}
                <Td className="p-0.5 bg-yellow-100"><NumBadge n={row.n7}/></Td>
                {/* Power advance cells */}
                {advance && <>
                  <DecCell val={row.dec0}/><DecCell val={row.dec1}/><DecCell val={row.dec2}/>
                  <DecCell val={row.dec3}/><DecCell val={row.dec4}/><DecCell val={row.dec5}/>
                  <Td className={DD_COLORS[row.dd]??''}>{row.dd}</Td>
                  <Td>{row.sc}</Td>
                  <Td className={BG_COT}>{row.cam}</Td>
                  <Td>{row.snt.length>0?row.snt.join('-'):''}</Td>
                  <Td className={BG_COT}>{row.snt_cnt>0?row.snt_cnt:''}</Td>
                  <Td>{row.xx.length>0?row.xx.join('-'):''}</Td>
                  <Td>{row.ke>0?row.ke:''}</Td>
                  <Td>{row.t1>0?row.t1:''}</Td>
                  <Td className={BG_COT}>{row.g0>0?row.g0:''}</Td>
                  <Td>{row.p1>0?row.p1:''}</Td>
                  <Td className={BG_COT}>{row.mod||''}</Td>
                  <Td>{row.sum}</Td>
                  <Td className={row.jpp!==null?jppBg:''}>{row.jpp??'—'}</Td>
                  <Td className="text-red-600 font-semibold">{row.qh_hit.length>0?row.qh_hit.join(','):''}</Td>
                  <Td className="text-gray-600 text-left whitespace-normal max-w-[100px]">{row.qhl.length>0?row.qhl.join(','):''}</Td>
                  <Td className={BG_COT}>{row.qhc>0?row.qhc:''}</Td>
                  <Td className={row.jp1ck===0?'bg-red-500 text-white font-bold':''}>{row.jp1ck}</Td>
                  <Td className={row.jp1_amt?'text-red-700 font-semibold':''}>{fmtAmt(row.jp1_amt)}</Td>
                  <Td className={row.jp2_amt?'text-green-700 font-semibold':''}>{fmtAmt(row.jp2_amt)}</Td>
                  <Td className="font-mono">{row.level}</Td>
                  <Td className={BG_COT}>{row.level_cnt??'—'}</Td>
                  <Td className="font-mono">{row.cl6}</Td>
                  <Td className={BG_COT}>{row.cl6_cnt??'—'}</Td>
                  <Td className="text-left text-gray-700 max-w-[140px] whitespace-normal">{row.jpm_info}</Td>
                  <Td className={row.jpm_cnt>=5?'bg-red-400 text-white font-bold':row.jpm_cnt>=4?'bg-orange-300 font-bold':row.jpm_cnt>=3?'bg-yellow-200':''}>{row.jpm_cnt>0?row.jpm_cnt:''}</Td>
                </>}
                <Td/>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
