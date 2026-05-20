import { NextRequest, NextResponse } from 'next/server'
import { runSync } from '@/app/lib/vuaxs/syncService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, fromDate } = body

    if (!token) {
      return NextResponse.json({ error: 'Thiếu token' }, { status: 400 })
    }

    const result = await runSync(token, fromDate)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
