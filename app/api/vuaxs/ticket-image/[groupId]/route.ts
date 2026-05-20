import { NextRequest, NextResponse } from 'next/server'
import { getGroupImagePath } from '@/app/lib/vuaxs/dbQueries'
import fs from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const groupId = parseInt(params.groupId)
    if (isNaN(groupId)) {
      return NextResponse.json({ error: 'groupId không hợp lệ' }, { status: 400 })
    }

    const imagePath = await getGroupImagePath(groupId)
    if (!imagePath || !fs.existsSync(imagePath)) {
      return NextResponse.json({ error: 'Không tìm thấy ảnh' }, { status: 404 })
    }

    const buffer = fs.readFileSync(imagePath)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
