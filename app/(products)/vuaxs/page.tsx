'use client'

import { useState, useEffect, useCallback } from 'react'
import { GroupHistory, StatusFilter } from '@/app/lib/vuaxs/types'
import { fetchHistoryGroup, groupByDate, exportToCSV, parseGameName } from '@/app/lib/vuaxs/api'
import GroupCard from './ui/GroupCard'
import StatsBar from './ui/StatsBar'
import FilterBar from './ui/FilterBar'

const TOKEN = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJpZFwiOjIwNjUwNjgsXCJwYXNzd29yZFwiOlwiMWJmMjAzZGYwNTRjNDY1YjY4ZDE4MTFkOWQ5MjBlYTNcIixcIm1zaXNkblwiOlwiODQ5NjYwMjA3MDlcIixcImFjY291bnRJZFwiOlwiODQ5NjYwMjA3MDlcIixcImZ1bGxuYW1lXCI6XCJUUlVPTkcgVklFVCBIVU5HXCIsXCJiaXJ0aGRheVwiOm51bGwsXCJqb2JcIjpudWxsLFwiZ2VuZGVyXCI6bnVsbCxcInN5bmlkXCI6bnVsbCxcImF2YXRhclVybFwiOm51bGwsXCJjbW5kXCI6XCIwNzkwNzcwMjQ4NTZcIixcImFkZHJlc3NcIjpcIjg3LzQgVHLhuqduIMSQw6xuaCBYdSBUUEhDTVwiLFwiZW1haWxcIjpcImh1bmd0djIzNkBnbWFpbC5jb21cIixcInJlZ2lzdGVyRGF0ZVwiOjE2MzI3MDk5NTMwMDAsXCJzZXNzaW9uSWRcIjpudWxsLFwiY2lmXCI6XCIzMDYxNDE1MlwiLFwibWJBY2NvdW50RGVmYXVsdFwiOm51bGwsXCJtYkVtYWlsXCI6bnVsbCxcIm1iRnVsbG5hbWVcIjpudWxsLFwibWJJZENhcmROb1wiOm51bGwsXCJ0b3RhbEJvdWdodEtlbm9PcmRlclwiOjB9IiwiZXhwIjoxNzgwMDM3MDEwfQ.Rs1rrKas4HU7i6ajZLOLFUgNiZQxLjRYe7_0FVpFbOm55hbcWh5L3E4oXZdV4_YtcFbSXjUrIkbqU2zMsEUc1g'

export default function VuaxsPage() {
  const [items, setItems] = useState<GroupHistory[]>([])
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [gameFilter, setGameFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (reset: boolean, f: StatusFilter, p: number) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchHistoryGroup(TOKEN, f, p)
      setItems(prev => reset ? res.items : [...prev, ...res.items])
      setTotal(res.total)
    } catch (e: any) {
      setError(e.message || 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
    setItems([])
    load(true, filter, 1)
  }, [filter, load])

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    load(false, filter, next)
  }

  const allGames = [...new Set(
    items.map(x => parseGameName(x.name).game).filter(Boolean)
  )]

  const filtered = gameFilter
    ? items.filter(x => parseGameName(x.name).game === gameFilter)
    : items

  const grouped = groupByDate(filtered)
  const hasMore = items.length < total && total > 0

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white px-4 py-5 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Lịch Sử Mua Chung</h1>
            <p className="text-red-200 text-sm mt-0.5">TRUONG VIET HUNG · 84966020709</p>
          </div>
          <button
            onClick={() => exportToCSV(filtered)}
            disabled={filtered.length === 0}
            className="bg-white/20 hover:bg-white/30 disabled:opacity-40 text-white text-sm px-3 py-2 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Xuất CSV
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <StatsBar items={items} total={total} />
        <FilterBar
          filter={filter}
          onFilterChange={(f) => { setFilter(f) }}
          gameFilter={gameFilter}
          onGameFilterChange={setGameFilter}
          games={allGames}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            ⚠️ {error}
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm">Đang tải...</p>
          </div>
        ) : filtered.length === 0 && !loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Không có dữ liệu</div>
        ) : (
          Object.entries(grouped).map(([date, dayItems]) => (
            <div key={date} className="mb-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                {date}
              </div>
              {dayItems.map(item => (
                <GroupCard key={item.id} item={item} />
              ))}
            </div>
          ))
        )}

        {hasMore && (
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-500 hover:bg-gray-50 transition disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full inline-block" />
                Đang tải...
              </span>
            ) : (
              `Tải thêm (đã xem ${items.length} / ${total})`
            )}
          </button>
        )}
      </div>
    </main>
  )
}
