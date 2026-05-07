import sql from '@/app/lib/db';

export interface LastJPRow {
  loai: 'PW' | 'MG' | 'LO';
  thu: string; ngay: string; ky: string;
  n1: number; n2: number; n3: number;
  n4: number; n5: number; n6: number; n7?: number;
}

export interface P655Latest {
  thu: string; ngay: string; ky: string;
  n1: number; n2: number; n3: number;
  n4: number; n5: number; n6: number; n7: number;
  prevN1: number; prevN2: number; prevN3: number;
  prevN4: number; prevN5: number; prevN6: number;
  qhl: number[];
}

export interface JpDdRow {
  ky: string; ngay: string; thu: string; dd: number;
  n1: number; n2: number; n3: number;
  n4: number; n5: number; n6: number;
}

function pn(s: string|null): number { return s ? parseInt(s.trim(),10)||0 : 0; }
const ALL_NUMS = Array.from({length:55},(_,i)=>i+1);
const NEXT_THU: Record<string,{thu:string;days:number}> = {
  'T3':{thu:'T5',days:2},'T5':{thu:'T7',days:2},'T7':{thu:'T3',days:3},
};
function addDays(dateStr:string,days:number):Date {
  const d=new Date(dateStr); d.setDate(d.getDate()+days); return d;
}

export async function fetchLastJP(): Promise<LastJPRow[]> {
  const [pw,mg,lo] = await Promise.all([
    sql<any[]>`SELECT thu,ngay,ky,n1,n2,n3,n4,n5,n6,n7 FROM public.p655kq WHERE jp1_cnt>0 ORDER BY ky DESC LIMIT 1`,
    sql<any[]>`SELECT thu,ngay,ky,n1,n2,n3,n4,n5,n6 FROM public.m645kq WHERE jp_cnt>0 ORDER BY ky DESC LIMIT 1`,
    sql<any[]>`SELECT thu,ngay,ky,n1,n2,n3,n4,n5,n6 FROM public.l535kq WHERE dd_cnt>0 ORDER BY ky DESC LIMIT 1`,
  ]);
  const result: LastJPRow[] = [];
  if (pw[0]) result.push({loai:'PW',thu:pw[0].thu?.trim()??'',ngay:String(pw[0].ngay),ky:pw[0].ky?.trim()??'',n1:pn(pw[0].n1),n2:pn(pw[0].n2),n3:pn(pw[0].n3),n4:pn(pw[0].n4),n5:pn(pw[0].n5),n6:pn(pw[0].n6),n7:pn(pw[0].n7)});
  if (mg[0]) result.push({loai:'MG',thu:mg[0].thu?.trim()??'',ngay:String(mg[0].ngay),ky:mg[0].ky?.trim()??'',n1:pn(mg[0].n1),n2:pn(mg[0].n2),n3:pn(mg[0].n3),n4:pn(mg[0].n4),n5:pn(mg[0].n5),n6:pn(mg[0].n6)});
  if (lo[0]) result.push({loai:'LO',thu:lo[0].thu?.trim()??'',ngay:String(lo[0].ngay),ky:lo[0].ky?.trim()??'',n1:pn(lo[0].n1),n2:pn(lo[0].n2),n3:pn(lo[0].n3),n4:pn(lo[0].n4),n5:pn(lo[0].n5),n6:pn(lo[0].n6)});
  return result;
}

export async function fetchP655Latest(qhKy=20): Promise<P655Latest|null> {
  const rows = await sql<any[]>`
    SELECT thu,ngay,ky,n1,n2,n3,n4,n5,n6,n7 FROM public.p655kq
    ORDER BY ky DESC LIMIT ${qhKy+2}
  `;
  if (!rows[0]) return null;
  const cur=rows[0]; const prev=rows[1];
  const seen=new Set<number>();
  for(let i=1;i<=Math.min(qhKy,rows.length-1);i++)
    [rows[i].n1,rows[i].n2,rows[i].n3,rows[i].n4,rows[i].n5,rows[i].n6].forEach((v:string)=>seen.add(pn(v)));
  const qhl=ALL_NUMS.filter(n=>!seen.has(n));
  return {
    thu:cur.thu?.trim()??'',ngay:String(cur.ngay),ky:cur.ky?.trim()??'',
    n1:pn(cur.n1),n2:pn(cur.n2),n3:pn(cur.n3),n4:pn(cur.n4),n5:pn(cur.n5),n6:pn(cur.n6),n7:pn(cur.n7),
    prevN1:prev?pn(prev.n1):0,prevN2:prev?pn(prev.n2):0,prevN3:prev?pn(prev.n3):0,
    prevN4:prev?pn(prev.n4):0,prevN5:prev?pn(prev.n5):0,prevN6:prev?pn(prev.n6):0,
    qhl,
  };
}

export async function fetchJpNgayDd(latest: P655Latest): Promise<{
  ddKeTiep:number; thuKeTiep:string; ngayKeTiep:string;
  fullKy:JpDdRow[]; last128:JpDdRow[];
}> {
  const next=NEXT_THU[latest.thu]??{thu:'?',days:2};
  const nextDate=addDays(latest.ngay,next.days);
  const ddKeTiep=nextDate.getDate();
  const ngayKeTiep=`${String(nextDate.getDate()).padStart(2,'0')}/${String(nextDate.getMonth()+1).padStart(2,'0')}/${nextDate.getFullYear()}`;

  const [allJP,last128rows] = await Promise.all([
    sql<any[]>`SELECT ky,ngay,thu,n1,n2,n3,n4,n5,n6 FROM public.p655kq WHERE jp1_cnt>0 ORDER BY ky DESC`,
    sql<any[]>`SELECT ky,ngay,thu,n1,n2,n3,n4,n5,n6 FROM public.p655kq ORDER BY ky DESC LIMIT 128`,
  ]);

  const toRow=(r:any):JpDdRow=>({
    ky:r.ky?.trim()??'',ngay:String(r.ngay),thu:r.thu?.trim()??'',
    dd:new Date(r.ngay).getDate(),
    n1:pn(r.n1),n2:pn(r.n2),n3:pn(r.n3),n4:pn(r.n4),n5:pn(r.n5),n6:pn(r.n6),
  });

  return {
    ddKeTiep, thuKeTiep:next.thu, ngayKeTiep,
    fullKy: allJP.map(toRow).filter(r=>r.dd===ddKeTiep),
    last128: last128rows.map(toRow).filter(r=>r.dd===ddKeTiep),
  };
}
