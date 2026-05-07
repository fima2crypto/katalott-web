import Link from 'next/link';
import { fetchLastJP, fetchP655Latest, fetchJpNgayDd, P655Latest } from '@/app/lib/p655/dashboard_data';
import { fetchP655List } from '@/app/lib/p655/data';
import { P655Row } from '@/app/lib/p655/definitions';
import L14Panel from '@/app/(products)/p655/ui/L14';

const DEC_COLORS: Record<number,string> = {
  0:'bg-red-400 text-white',1:'bg-orange-400 text-white',
  2:'bg-yellow-400 text-black',3:'bg-green-500 text-white',
  4:'bg-blue-500 text-white',5:'bg-purple-500 text-white',
};
const THU_COLORS: Record<string,string> = {
  T3:'bg-blue-500 text-white',T5:'bg-purple-500 text-white',T7:'bg-orange-500 text-white',
};
const BG_COT='bg-yellow-100';

function numBg(n:number){ return DEC_COLORS[Math.floor(n/10)]??'bg-gray-200 text-black'; }
function fmtDate(d:string){ if(!d)return''; const dt=new Date(d); return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`; }
function NumBadge({n,extraBg}:{n:number;extraBg?:string}){
  if(!n) return <span className="w-7 h-6 inline-flex items-center justify-center text-xs text-gray-300">-</span>;
  return <span className={`w-7 h-6 inline-flex items-center justify-center text-xs rounded font-bold ${extraBg??numBg(n)}`}>{String(n).padStart(2,'0')}</span>;
}
function Th({children,className='',colSpan}:{children:React.ReactNode;className?:string;colSpan?:number}){
  return <th colSpan={colSpan} className={`px-1 py-1 text-center text-xs font-semibold border border-gray-300 whitespace-nowrap ${className}`}>{children}</th>;
}
function Td({children,className='',colSpan}:{children:React.ReactNode;className?:string;colSpan?:number}){
  return <td colSpan={colSpan} className={`px-1 py-0.5 text-center text-xs border border-gray-200 whitespace-nowrap ${className}`}>{children}</td>;
}

// ==================== L2 ====================
function L2BangSo({latest}:{latest:P655Latest}){
  const n16Set=new Set([latest.n1,latest.n2,latest.n3,latest.n4,latest.n5,latest.n6]);
  const qhlSet=new Set(latest.qhl);
  const cols=[0,10,20,30,40,50];
  const renderNum=(n:number)=>{
    if(n<1||n>55) return <td key={n} className="w-7 h-6 border border-transparent"/>;
    const isN7=n===latest.n7,isN16=n16Set.has(n),isQH=qhlSet.has(n);
    const bg=isN7?'bg-green-500 text-white':isN16?'bg-yellow-400 text-black':isQH?'bg-purple-400 text-white':'bg-gray-100 text-gray-600';
    return <td key={n} className="px-0.5 py-0.5 border border-gray-200">
      <span className={`w-7 h-6 inline-flex items-center justify-center text-xs rounded font-bold ${bg}`}>{String(n).padStart(2,'0')}</span>
    </td>;
  };
  return (
    <div className="bg-red-50 border border-red-200 rounded p-2">
      <div className="text-xs font-bold text-red-800 mb-1">L2 - Bảng Số</div>
      <table className="border-collapse text-xs">
        <tbody>
          {[9,8,7,6,5,4,3,2,1].map(r=><tr key={r}>{cols.map(c=>renderNum(c===0?r:c+r))}</tr>)}
          <tr>{cols.map(c=>renderNum(c===0?0:c))}</tr>
        </tbody>
      </table>
      <div className="flex gap-2 mt-1 text-xs">
        <span className="flex items-center gap-0.5"><span className="w-3 h-3 bg-yellow-400 rounded inline-block"/>N16</span>
        <span className="flex items-center gap-0.5"><span className="w-3 h-3 bg-purple-400 rounded inline-block"/>QH</span>
        <span className="flex items-center gap-0.5"><span className="w-3 h-3 bg-green-500 rounded inline-block"/>N7</span>
      </div>
    </div>
  );
}

// ==================== L3 ====================
function L3T1G0P1({latest}:{latest:P655Latest}){
  const prev=[latest.prevN1,latest.prevN2,latest.prevN3,latest.prevN4,latest.prevN5,latest.prevN6];
  const rows=[
    {label:'T1',nums:prev.map(n=>n-1<1?null:n-1),labelCls:'text-gray-700'},
    {label:'G0',nums:prev.map(n=>n as number|null),labelCls:'text-gray-700'},
    {label:'P1',nums:prev.map(n=>n+1>55?null:n+1),labelCls:'text-gray-700'},
    {label:'QH',nums:latest.qhl as (number|null)[],rowBg:'bg-purple-50',labelCls:'text-purple-700'},
  ];
  return (
    <div className="bg-green-100 border border-green-400 rounded p-2">
      <div className="text-xs font-bold text-green-900 mb-1">L3 - T1G0P1</div>
      <table className="border-collapse text-xs">
        <tbody>
          {rows.map(({label,nums,rowBg,labelCls})=>(
            <tr key={label} className={rowBg??''}>
              <td className={`px-2 py-0.5 border border-gray-200 font-bold text-right w-8 ${labelCls}`}>{label}</td>
              <td className="px-1 py-0.5 border border-gray-200">
                <div className="flex flex-wrap gap-0.5">
                  {nums.map((n,i)=>n?<NumBadge key={i} n={n}/>:<span key={i} className="w-7 h-6 inline-flex items-center justify-center text-xs text-gray-300">-</span>)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==================== L5 ====================
function L5InputTrx(){
  return (
    <div className="bg-purple-50 border border-purple-200 rounded p-2">
      <div className="text-xs font-bold text-purple-800 mb-1">L5 - Input TRX</div>
      <table className="border-collapse text-xs">
        <thead><tr className="bg-gray-100">
          <Th>Vé</Th>
          {['N1','N2','N3','N4','N5','N6'].map(n=><Th key={n}>{n}</Th>)}
        </tr></thead>
        <tbody>
          {['v1','v2','v3','v4','v5','v6'].map(v=>(
            <tr key={v}>
              <Td className="bg-yellow-50 font-bold text-gray-600">{v}</Td>
              {[1,2,3,4,5,6].map(i=>(
                <td key={i} className="px-0.5 py-0.5 border border-gray-200">
                  <input type="number" min={1} max={55}
                    className="w-10 text-center text-xs border-0 bg-transparent focus:outline-none focus:bg-blue-50 rounded"/>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==================== L6 SoSEQ ====================
const DEC_SEQ: Record<number,string> = {
  0:'bg-red-400 text-white',1:'bg-orange-400 text-white',
  2:'bg-yellow-400 text-black',3:'bg-green-500 text-white',
  4:'bg-blue-500 text-white',5:'bg-purple-500 text-white',
};
function computeSoSEQ(rows:P655Row[]):{lech:number;nums:number[]}[]{
  const found=new Map<number,number>();
  for(let i=0;i<rows.length;i++){
    for(const n of rows[i].n16) if(!found.has(n)) found.set(n,i);
    if(found.size===55) break;
  }
  const groups=new Map<number,number[]>();
  for(const [num,lech] of found.entries()){
    if(!groups.has(lech)) groups.set(lech,[]);
    groups.get(lech)!.push(num);
  }
  for(const arr of groups.values()) arr.sort((a,b)=>a-b);
  return Array.from(groups.entries()).sort((a,b)=>a[0]-b[0]).map(([lech,nums])=>({lech,nums}));
}
function L6SoSEQ({allData,qhKy=20}:{allData:P655Row[];qhKy?:number}){
  const entries=computeSoSEQ(allData);
  return (
    <div className="flex-shrink-0 bg-yellow-50 border border-yellow-300 rounded p-2 overflow-y-auto" style={{maxHeight:'80vh'}}>
      <div className="text-xs font-bold text-yellow-800 mb-1">L6 - SoSEQ</div>
      <table className="border-collapse text-xs">
        <thead className="sticky top-0"><tr className="bg-gray-100">
          <th className="px-2 py-1 text-center font-semibold border border-gray-300 bg-gray-200">Lệch</th>
          <th className="px-2 py-1 text-center font-semibold border border-gray-300 bg-gray-200">Số</th>
        </tr></thead>
        <tbody>
          {entries.map(({lech,nums})=>(
            <tr key={lech} className={lech===0?'bg-yellow-50':'hover:bg-gray-50'}>
              <td className={`px-2 py-0.5 text-center text-xs font-bold border border-gray-200 ${lech===0?'text-red-600':lech>qhKy?'text-orange-600':'text-gray-700'}`}>{lech}</td>
              <td className="px-1 py-0.5 border border-gray-200">
                <div className="flex flex-wrap gap-0.5 min-w-[80px]">
                  {nums.map(n=>(
                    <span key={n} className={`w-6 h-5 inline-flex items-center justify-center text-xs rounded font-bold ${DEC_SEQ[Math.floor(n/10)]??'bg-gray-200'}`}>
                      {String(n).padStart(2,'0')}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==================== L7 Mega ====================
function L7Mega({data}:{data:P655Row[]}){
  return (
    <div className="bg-blue-50 border border-blue-200 rounded p-2 overflow-y-auto" style={{maxHeight:'80vh'}}>
      <div className="text-xs font-bold text-blue-800 mb-1">Mega</div>
      <table className="border-collapse text-xs">
        <thead className="sticky top-0"><tr className="bg-blue-200">
          <Th className="bg-blue-200">Trùng</Th>
          {[1,2,3,4,5,6].map(i=><Th key={i} className="bg-blue-100">N{i}</Th>)}
        </tr></thead>
        <tbody>
          {data.map(row=>{
            const m=row.mega;
            return (
              <tr key={row.ky} className="hover:bg-blue-100">
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ==================== L7 Power ====================
function L7Power({data}:{data:P655Row[]}){
  return (
    <div className="flex-1 bg-cyan-50 border border-cyan-200 rounded p-2 overflow-x-auto overflow-y-auto" style={{maxHeight:'80vh'}}>
      <div className="text-xs font-bold text-cyan-800 mb-1">Power</div>
      <table className="border-collapse text-xs min-w-max">
        <thead className="sticky top-0"><tr className="bg-gray-100">
          <Th className="bg-gray-200">#</Th>
          <Th className="bg-gray-200">Thứ</Th>
          <Th className="bg-gray-200">Ngày</Th>
          <Th className={BG_COT}>Kỳ</Th>
          {[1,2,3,4,5,6].map(i=><Th key={i} className="bg-blue-50">N{i}</Th>)}
          <Th className="bg-yellow-100">N7</Th>
        </tr></thead>
        <tbody>
          {data.map((row,idx)=>{
            const ngayBg=(row.jp1_cnt>0&&row.jp2_cnt>0)?'bg-purple-500 text-white font-bold'
              :row.jp1_cnt>0?'bg-red-500 text-white font-bold'
              :row.jp2_cnt>0?'bg-green-500 text-white font-bold':'';
            return (
              <tr key={row.ky} className="hover:bg-blue-50">
                <Td className="bg-gray-50 text-gray-500">{idx+1}</Td>
                <Td className={`font-semibold ${THU_COLORS[row.thu]??''}`}>{row.thu}</Td>
                <Td className={ngayBg}>{fmtDate(row.ngay)}</Td>
                <Td className={`font-mono font-bold ${BG_COT}`}>{row.ky}</Td>
                {[row.n1,row.n2,row.n3,row.n4,row.n5,row.n6].map((n,i)=><Td key={i} className="p-0.5"><NumBadge n={n}/></Td>)}
                <Td className="p-0.5 bg-yellow-100"><NumBadge n={row.n7}/></Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ==================== MAIN ====================
export default async function P655DashboardPage() {
  const [lastJP, latest, allData] = await Promise.all([
    fetchLastJP(),
    fetchP655Latest(20),
    fetchP655List({limit:9999, qh_ky:20}),
  ]);
  const jpDd = latest ? await fetchJpNgayDd(latest) : null;
  const kqData = allData.slice(0, 20);

  return (
    <div className="min-h-screen bg-gray-50 font-mono">
      {/* Header */}
      <div className="bg-red-50 border-b border-red-300 px-4 py-3 flex items-center gap-4 flex-wrap">
        <Link href="/p655" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-purple-800">🎱 P655 Dashboard</h1>
        {latest && (
          <span className="text-xs text-gray-600">
            Kỳ mới nhất: <span className="font-bold text-purple-700">{latest.ky}</span> — {fmtDate(latest.ngay)} {latest.thu}
          </span>
        )}
      </div>

      <div className="p-3">
        {/* Layout: 3 cot chinh */}
        <div className="flex gap-3 items-start">

          {/* COT 1: L3 + L2 + L6 */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {latest && <L3T1G0P1 latest={latest}/>}
            {latest && <L2BangSo latest={latest}/>}
            <L6SoSEQ allData={allData} qhKy={20}/>
          </div>

          {/* COT 2: L14 + L7 Mega */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <L14Panel lastJP={lastJP} jpDd={jpDd}/>
            <L7Mega data={kqData}/>
          </div>

          {/* COT 3: L5 + L7 Power */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <L5InputTrx/>
            <L7Power data={kqData}/>
          </div>

        </div>
      </div>
    </div>
  );
}