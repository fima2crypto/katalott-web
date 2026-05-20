import { GroupHistory, GroupDetail } from './types'
import { isGroupFinal, upsertGroupBasic, upsertGroupDetail } from './dbQueries'
import { downloadTicketImage, ticketImageExists, getTicketImagePath } from './imageHelper'
import { migrate } from './migrate'

const ACCOUNT_ID = '84966020709'
const PAGE_SIZE = 20
const BASE_URL = 'https://keno.vuaxoso.vn:10311/api/app/group'

export interface SyncProgress {
  total: number
  synced: number
  skipped: number
  errors: number
  currentGroup?: number
}

async function fetchListPage(
  token: string,
  page: number
): Promise<{ items: GroupHistory[]; total: number }> {
  const params = new URLSearchParams({
    accountId: ACCOUNT_ID,
    status: '1,2,3',
    page: String(page),
    pageSize: String(PAGE_SIZE),
  })

  const res = await fetch(`${BASE_URL}/get_list_history_group?${params}`, {
    headers: {
      'X-Access-Token': token,
      Accept: 'application/json',
      Origin: 'https://vuaxoso.vn',
      Referer: 'https://vuaxoso.vn/',
    },
    cache: 'no-store',
  })

  const json = await res.json()
  return {
    items: json.data || [],
    total: json.total || json.totalElements || 0,
  }
}

async function fetchDetail(token: string, groupId: number): Promise<GroupDetail> {
  const params = new URLSearchParams({
    accountId: ACCOUNT_ID,
    groupId: String(groupId),
  })

  const res = await fetch(`${BASE_URL}/get_detail_history_group?${params}`, {
    headers: {
      'X-Access-Token': token,
      Accept: 'application/json',
      Origin: 'https://vuaxoso.vn',
      Referer: 'https://vuaxoso.vn/',
    },
    cache: 'no-store',
  })

  const json = await res.json()
  if (json.result !== 0) throw new Error(json.resultDesc || 'API error')
  return json.data as GroupDetail
}

function parseVNDate(str: string): Date | null {
  const [datePart, timePart] = str.split(' ')
  if (!datePart) return null
  const [d, m, y] = datePart.split('/')
  return new Date(`${y}-${m}-${d}T${timePart || '00:00:00'}`)
}

export async function runSync(
  token: string,
  fromDate?: string, // "dd/mm/yyyy"
  onProgress?: (p: SyncProgress) => void
): Promise<SyncProgress> {
  await migrate()

  const progress: SyncProgress = { total: 0, synced: 0, skipped: 0, errors: 0 }

  let page = 1
  let hasMore = true

  while (hasMore) {
    const { items, total } = await fetchListPage(token, page)
    progress.total = total

    if (items.length === 0) break

    for (const group of items) {
      // Lọc theo fromDate — dừng khi gặp group cũ hơn ngày chọn
      if (fromDate && group.timeCutOff) {
        const groupDate = parseVNDate(group.timeCutOff)
        const from = parseVNDate(fromDate + ' 00:00:00')
        if (groupDate && from && groupDate < from) {
          hasMore = false
          break
        }
      }

      progress.currentGroup = group.id
      onProgress?.(progress)

      // Đã final → skip hoàn toàn
      const alreadyFinal = await isGroupFinal(group.id)
      if (alreadyFinal) {
        progress.skipped++
        onProgress?.(progress)
        continue
      }

      try {
        // Lưu basic trước
        await upsertGroupBasic(group)

        // Fetch detail
        const detail = await fetchDetail(token, group.id)

        // Download ảnh nếu có
        let imagePath: string | null = null
        if (detail.ticket_image) {
          if (ticketImageExists(group.id)) {
            imagePath = getTicketImagePath(group.id)
          } else {
            imagePath = await downloadTicketImage(group.id, detail.ticket_image)
          }
        }

        // Lưu full detail + tickets + numbers + numberFinish
        await upsertGroupDetail(detail, imagePath)

        progress.synced++
      } catch (e) {
        console.error(`[vuaxs] Lỗi sync groupId=${group.id}:`, e)
        progress.errors++
      }

      onProgress?.(progress)
    }

    const fetched = (page - 1) * PAGE_SIZE + items.length
    hasMore = hasMore && fetched < total
    page++
  }

  progress.currentGroup = undefined
  onProgress?.(progress)
  return progress
}
