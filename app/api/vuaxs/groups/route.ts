import { NextRequest, NextResponse } from 'next/server'
import { getGroupsFromDB, getGroupsCountFromDB, getLastUpdatedAt } from '@/app/lib/vuaxs/dbQueries'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const offset = (page - 1) * pageSize

    const [items, total, lastUpdated] = await Promise.all([
      getGroupsFromDB(pageSize, offset),
      getGroupsCountFromDB(),
      getLastUpdatedAt(),
    ])

    const data = items.map((g: any) => ({
      id: g.id,
      name: g.name,
      groupStatus: g.group_status,
      procress: g.procress,
      percentageOfShares: g.percentage_of_shares,
      moneyOfShares: g.money_of_shares,
      numberOfMembers: g.number_of_members,
      numberOfTickets: g.number_of_tickets,
      drawInfo: { drawId: g.draw_id, openDate: g.open_date, drawCode: null, category: 0 },
      timeCutOff: g.time_cut_off,
      createTime: g.create_time,
      statusWin: g.status_win,
      prizeWinAfterTax: g.prize_win_after_tax,
      isFinal: g.is_final,
      ticketImagePath: g.ticket_image_path,
      // numberFinish chỉ có khi hoàn thành 100%
      numberFinish: (g.group_status === 2 && g.procress >= 100 && g.number_finish)
        ? (Array.isArray(g.number_finish) ? g.number_finish : [])
        : [],
      updatedAt: g.updated_at,
    }))

    return NextResponse.json({
      result: 0,
      data,
      total,
      lastUpdated: lastUpdated?.toISOString() ?? null,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
