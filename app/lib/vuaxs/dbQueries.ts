import sql from '@/app/lib/db'
import { GroupDetail, GroupHistory } from './types'

export async function isGroupFinal(groupId: number): Promise<boolean> {
  const rows = await sql`SELECT is_final FROM vuaxs_groups WHERE id = ${groupId}`
  if (rows.length === 0) return false
  return rows[0].is_final
}

function calcIsFinal(detail: GroupDetail, ticketImagePath: string | null): boolean {
  const hasImage = !detail.ticket_image || ticketImagePath !== null
  return detail.groupStatus === 2 && detail.statusWin !== -1 && hasImage
}

export async function upsertGroupBasic(group: GroupHistory): Promise<void> {
  await sql`
    INSERT INTO vuaxs_groups (
      id, name, group_status, procress, percentage_of_shares,
      money_of_shares, number_of_members, number_of_tickets,
      draw_id, open_date, time_cut_off, create_time,
      status_win, prize_win_after_tax, updated_at
    ) VALUES (
      ${group.id}, ${group.name}, ${group.groupStatus}, ${group.procress},
      ${group.percentageOfShares}, ${group.moneyOfShares},
      ${group.numberOfMembers}, ${group.numberOfTickets},
      ${group.drawInfo.drawId}, ${group.drawInfo.openDate},
      ${group.timeCutOff}, ${group.createTime},
      ${group.statusWin}, ${group.prizeWinAfterTax}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      group_status        = EXCLUDED.group_status,
      procress            = EXCLUDED.procress,
      status_win          = EXCLUDED.status_win,
      prize_win_after_tax = EXCLUDED.prize_win_after_tax,
      number_of_members   = EXCLUDED.number_of_members,
      number_of_tickets   = EXCLUDED.number_of_tickets,
      updated_at          = NOW()
  `
}

export async function upsertGroupDetail(
  detail: GroupDetail,
  ticketImagePath: string | null
): Promise<void> {
  const isFinal = calcIsFinal(detail, ticketImagePath)

  // Chỉ lưu numberFinish khi hoàn thành 100%
  const numberFinish = (detail.groupStatus === 2 && detail.procress >= 100 && detail.numberFinish?.length > 0)
    ? JSON.stringify(detail.numberFinish.map(n => n.num))
    : null

  await sql`
    INSERT INTO vuaxs_groups (
      id, name, group_status, procress, percentage_of_shares,
      money_of_shares, number_of_members, number_of_tickets,
      draw_id, open_date, time_cut_off, create_time,
      status_win, prize_win_after_tax,
      ticket_image_url, ticket_image_path, number_finish, is_final, updated_at
    ) VALUES (
      ${detail.id}, ${detail.name}, ${detail.groupStatus}, ${detail.procress},
      ${detail.percentageOfShares}, ${detail.moneyOfShares},
      ${detail.numberOfMembers}, ${detail.numberOfTickets},
      ${detail.drawInfo.drawId}, ${detail.drawInfo.openDate},
      ${detail.timeCutOff}, ${detail.createTime},
      ${detail.statusWin}, ${detail.prizeWinAfterTax},
      ${detail.ticket_image ?? null}, ${ticketImagePath},
      ${numberFinish}::jsonb, ${isFinal}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      group_status        = EXCLUDED.group_status,
      procress            = EXCLUDED.procress,
      status_win          = EXCLUDED.status_win,
      prize_win_after_tax = EXCLUDED.prize_win_after_tax,
      number_of_members   = EXCLUDED.number_of_members,
      number_of_tickets   = EXCLUDED.number_of_tickets,
      ticket_image_url    = EXCLUDED.ticket_image_url,
      ticket_image_path   = EXCLUDED.ticket_image_path,
      number_finish       = EXCLUDED.number_finish,
      is_final            = EXCLUDED.is_final,
      updated_at          = NOW()
  `

  // Upsert tickets
  for (const ticket of detail.listTicketInGroup ?? []) {
    const isMe = ticket.currentMember === 1
    await sql`
      INSERT INTO vuaxs_tickets (
        id, group_id, phone, percentage_of_shares,
        money_of_shares, is_me, prize_win_amount, prize_win_after_tax
      ) VALUES (
        ${ticket.id}, ${detail.id}, ${ticket.userId},
        ${ticket.percentageOfShares}, ${ticket.moneyOfShares},
        ${isMe}, ${ticket.prizeWinAmount}, ${ticket.prizeWinAfterTax}
      )
      ON CONFLICT (id) DO UPDATE SET
        prize_win_amount    = EXCLUDED.prize_win_amount,
        prize_win_after_tax = EXCLUDED.prize_win_after_tax
    `

    // Upsert numbers với composite PK (ticket_id, num)
    for (const info of ticket.numberInfos ?? []) {
      for (const n of info.numbers ?? []) {
        await sql`
          INSERT INTO vuaxs_numbers (ticket_id, group_id, num, status)
          VALUES (${ticket.id}, ${detail.id}, ${n.num}, ${n.status})
          ON CONFLICT (ticket_id, num) DO NOTHING
        `
      }
    }
  }
}

export async function getGroupImagePath(groupId: number): Promise<string | null> {
  const rows = await sql`SELECT ticket_image_path FROM vuaxs_groups WHERE id = ${groupId}`
  return rows[0]?.ticket_image_path ?? null
}

export async function getGroupsFromDB(limit = 20, offset = 0) {
  return await sql`
    SELECT * FROM vuaxs_groups
    ORDER BY id DESC
    LIMIT ${limit} OFFSET ${offset}
  `
}

export async function getGroupsCountFromDB(): Promise<number> {
  const rows = await sql`SELECT COUNT(*) as cnt FROM vuaxs_groups`
  return parseInt(rows[0].cnt)
}

export async function getGroupDetailFromDB(groupId: number) {
  const groups = await sql`SELECT * FROM vuaxs_groups WHERE id = ${groupId}`
  if (groups.length === 0) return null

  const tickets = await sql`
    SELECT * FROM vuaxs_tickets WHERE group_id = ${groupId} ORDER BY id
  `
  const numbers = await sql`
    SELECT * FROM vuaxs_numbers WHERE group_id = ${groupId} ORDER BY ticket_id, num
  `

  const ticketList = tickets.map((t: any) => ({
    id: t.id,
    userId: t.phone,
    percentageOfShares: t.percentage_of_shares,
    moneyOfShares: t.money_of_shares,
    currentMember: t.is_me ? 1 : 0,
    prizeWinAmount: t.prize_win_amount,
    prizeWinAfterTax: t.prize_win_after_tax,
    numberInfos: [{
      id: t.id,
      status: 4,
      percentageOfShares: t.percentage_of_shares,
      moneyOfShares: t.money_of_shares,
      numbers: numbers
        .filter((n: any) => n.ticket_id === t.id)
        .map((n: any) => ({ num: n.num, status: n.status })),
      prizeAmount: null,
    }],
  }))

  const g = groups[0]
  const numberFinishRaw = g.number_finish ?? []
  const numberFinish = Array.isArray(numberFinishRaw)
    ? numberFinishRaw.map((num: number) => ({ num, status: 0 }))
    : []

  return {
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
    ticket_image: g.ticket_image_url,
    ticket_image_path: g.ticket_image_path,
    numberFinish,
    listTicketInGroup: ticketList,
    updatedAt: g.updated_at,
  }
}

export async function getLastUpdatedAt(): Promise<Date | null> {
  const rows = await sql`SELECT MAX(updated_at) as last_updated FROM vuaxs_groups`
  return rows[0]?.last_updated ?? null
}
