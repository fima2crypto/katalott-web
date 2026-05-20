import { ApiResponse, GroupDetail, GroupHistory, ParsedGameName, StatusFilter } from './types'

export const ACCOUNT_ID = '84966020709'
export const PAGE_SIZE = 20

function parseVNDate(str?: string): Date | null {
  if (!str) return null
  const [datePart, timePart] = str.split(' ')
  if (!datePart) return null
  const [d, m, y] = datePart.split('/')
  return new Date(`${y}-${m}-${d}T${timePart || '00:00:00'}`)
}

export function formatDateTime(str?: string): string {
  const d = parseVNDate(str)
  if (!d || isNaN(d.getTime())) return '—'
  return d.toLocaleString('vi-VN')
}

export function formatDate(str?: string): string {
  const d = parseVNDate(str)
  if (!d || isNaN(d.getTime())) return 'Không rõ'
  return d.toLocaleDateString('vi-VN')
}

export function formatUpdatedAt(isoStr?: string | null): string {
  if (!isoStr) return 'Chưa có dữ liệu'
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function groupByDate(items: GroupHistory[]): Record<string, GroupHistory[]> {
  return items.reduce((acc, item) => {
    const key = formatDate(item.timeCutOff || item.createTime)
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, GroupHistory[]>)
}

export function getStatusLabel(status: number): { label: string; color: string } {
  switch (status) {
    case 1: return { label: 'Đang mở', color: 'blue' }
    case 2: return { label: 'Hoàn thành', color: 'green' }
    case 3: return { label: 'Đã huỷ', color: 'red' }
    default: return { label: 'Không rõ', color: 'gray' }
  }
}

export function parseGameName(name: string): ParsedGameName {
  const parts = name.split(' - ')
  return {
    game: parts[0]?.trim() || 'DT',
    type: parts[1]?.trim() || '',
  }
}

export function getStatusParam(filter: StatusFilter): string {
  if (filter === 'all') return '1,2,3'
  return filter
}

// Fetch từ API vuaxoso (online)
export async function fetchHistoryGroup(
  token: string,
  filter: StatusFilter,
  page: number
): Promise<{ items: GroupHistory[]; total: number; lastUpdated: null }> {
  const params = new URLSearchParams({
    accountId: ACCOUNT_ID,
    status: getStatusParam(filter),
    page: String(page),
    pageSize: String(PAGE_SIZE),
  })

  const res = await fetch(`/api/vuaxs/history?${params}`, {
    headers: { 'X-Access-Token': token, Accept: 'application/json' },
  })

  const data: ApiResponse & { error?: string } = await res.json()
  if (!res.ok || data.result !== 0) {
    throw new Error(data.error || data.resultDesc || `HTTP ${res.status}`)
  }

  return {
    items: (data.data as GroupHistory[]) || [],
    total: data.total || data.totalElements || 0,
    lastUpdated: null,
  }
}

// Fetch từ DB (offline fallback)
export async function fetchHistoryFromDB(
  page: number
): Promise<{ items: GroupHistory[]; total: number; lastUpdated: string | null }> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
  })

  const res = await fetch(`/api/vuaxs/groups?${params}`)
  const data = await res.json()

  if (!res.ok || data.error) throw new Error(data.error || 'Lỗi load DB')

  return {
    items: data.data || [],
    total: data.total || 0,
    lastUpdated: data.lastUpdated ?? null,
  }
}

// Fetch detail từ API vuaxoso (online)
export async function fetchGroupDetail(
  token: string,
  groupId: number
): Promise<GroupDetail> {
  const params = new URLSearchParams({
    accountId: ACCOUNT_ID,
    groupId: String(groupId),
  })

  const res = await fetch(`/api/vuaxs/history-detail?${params}`, {
    headers: { 'X-Access-Token': token, Accept: 'application/json' },
  })

  const json: ApiResponse & { error?: string } = await res.json()
  if (!res.ok || json.result !== 0) {
    throw new Error(json.error || json.resultDesc || `HTTP ${res.status}`)
  }

  return json.data as GroupDetail
}

// Fetch detail từ DB (offline fallback)
export async function fetchGroupDetailFromDB(groupId: number): Promise<GroupDetail> {
  const res = await fetch(`/api/vuaxs/groups/${groupId}`)
  const json = await res.json()

  if (!res.ok || json.error) throw new Error(json.error || 'Không tìm thấy trong DB')

  return json.data as GroupDetail
}

export function exportToCSV(items: GroupHistory[]): void {
  const headers = [
    'ID', 'Tên nhóm', 'Game', 'Loại bao', 'Trạng thái',
    'Kỳ quay', 'Ngày mở thưởng', 'Thành viên', 'Số vé',
    'Tiến độ (%)', 'Góp (%)', 'Số tiền góp (đ)',
    'Thời gian đóng', 'Ngày tạo', 'Giải thưởng (đ)',
  ]
  const rows = items.map(item => {
    const { game, type } = parseGameName(item.name)
    const { label } = getStatusLabel(item.groupStatus)
    return [
      item.id, item.name, game, type, label,
      item.drawInfo.drawId, item.drawInfo.openDate,
      item.numberOfMembers, item.numberOfTickets,
      item.procress, item.percentageOfShares, item.moneyOfShares,
      item.timeCutOff, item.createTime, item.prizeWinAfterTax,
    ]
  })
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vuaxoso_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
