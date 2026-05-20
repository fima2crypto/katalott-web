import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = request.headers.get('x-access-token') || ''
  const apiUrl = `https://keno.vuaxoso.vn:10311/api/app/group/get_list_history_group?${searchParams.toString()}`

  try {
    const res = await fetch(apiUrl, {
      headers: {
        'X-Access-Token': token,
        'Accept': 'application/json',
        'Origin': 'https://vuaxoso.vn',
        'Referer': 'https://vuaxoso.vn/',
      },
      cache: 'no-store',
    })
    const text = await res.text()
    if (!res.ok) {
      return NextResponse.json({ error: `API lỗi ${res.status}`, body: text }, { status: res.status })
    }
    return NextResponse.json(JSON.parse(text))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
