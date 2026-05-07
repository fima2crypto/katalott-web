import Link from 'next/link';
import { fetchLastJP, fetchP655Latest, fetchJpNgayDd, P655Latest } from '@/app/lib/p655/dashboard_data';
import { fetchP655List } from '@/app/lib/p655/data';
import { P655Row } from '@/app/lib/p655/definitions';
import DashboardRight from '@/app/(products)/p655/ui/DashboardRight';

const DEC_COLORS: Record<number,string> = {
  0:'bg-red-400 text-white',1:'bg-orange-400 text-white',
  2:'bg-yellow-400 text-black',3:'bg-green-500 text-white',
  4:'bg-blue-500 text-white',5:'bg-purple-500 text-white',
};
function numBg(n:number){ return DEC_COLORS[Math.floor(n/10)]??'bg-gray-200 text-black'; }
function fmtDate(d:string){ if(!d)return''; const dt=new Date(d); return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`; }
function NumBadge({n,extraBg}:{n:number;extraBg?:string}){
  if(!n) return <span className="w-7 h-6 inline-flex items-center justify-center text-xs text-gray-300">-</span>;
  return <span className={`w-7 h-6 inline-flex items-center justify-center text-xs rounded font-bold ${extraBg??numBg(n)}`}>{String(n).padStart(2,'00')}</span>;
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
                  {nums.map((n,i)=>n
                    ?<NumBadge key={i} n={n}/>
                    :<span key={i} className="w-7 h-6 inline-flex items-center justify-center text-xs text-gray-300">-</span>
                  )}
                </div>
              </td>
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

      {/* Row 1: L3 + L2 */}
      {latest && (
        <div className="p-3 flex gap-2 items-start">
          <L3T1G0P1 latest={latest}/>
          <L2BangSo latest={latest}/>
        </div>
      )}

      {/* Row 2: L6 ngang hang L7 */}
      <div className="p-3 pt-0 flex gap-3 items-start overflow-x-auto">
        <L6SoSEQ allData={allData} qhKy={20}/>
        <DashboardRight
          lastJP={lastJP}
          jpDd={jpDd}
          kqData={kqData}
          qhKy={20}
        />
      </div>
    </div>
  );
}
