import { NextResponse } from 'next/server';
import { fetchJackpotList } from '@/app/lib/kenokq/jackpot_data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tu_ngay = searchParams.get('tu_ngay') ?? undefined;
  const den_ngay = searchParams.get('den_ngay') ?? undefined;
  const limit = parseInt(searchParams.get('limit') || '200');

  try {
    const data = await fetchJackpotList({ tu_ngay, den_ngay, limit });
    return NextResponse.json({ total: data.length, data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
