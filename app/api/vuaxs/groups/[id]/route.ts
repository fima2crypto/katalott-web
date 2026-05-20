import { NextRequest, NextResponse } from 'next/server'
import { getGroupDetailFromDB } from '@/app/lib/vuaxs/dbQueries'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id)
    if (isNaN(groupId)) {
      return NextResponse.json({ error: 'groupId không hợp lệ' }, { status: 400 })
    }

    const detail = await getGroupDetailFromDB(groupId)
    if (!detail) {
      return NextResponse.json({ error: 'Không tìm thấy nhóm trong DB' }, { status: 404 })
    }

    return NextResponse.json({ result: 0, data: detail })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
