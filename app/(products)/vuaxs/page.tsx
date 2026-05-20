'use client'

import { useState, useEffect, useCallback } from 'react'
import { GroupHistory, StatusFilter } from '@/app/lib/vuaxs/types'
import {
  fetchHistoryGroup, fetchHistoryFromDB,
  groupByDate, exportToCSV, parseGameName, formatUpdatedAt
} from '@/app/lib/vuaxs/api'
import GroupCard from './ui/GroupCard'
import StatsBar from './ui/StatsBar'
import FilterBar from './ui/FilterBar'
import GroupDetailModal from './ui/GroupDetailModal'
import SyncModal from './ui/SyncModal'

const TOKEN = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJpZFwiOjIwNjUwNjgsXCJwYXNzd29yZFwiOlwiMWJmMjAzZGYwNTRjNDY1YjY4ZDE4MTFkOWQ5MjBlYTNcIixcIm1zaXNkblwiOlwiODQ5NjYwMjA3MDlcIixcImFjY291bnRJZFwiOlwiODQ5NjYwMjA3MDlcIixcImZ1bGxuYW1lXCI6XCJUUlVPTkcgVklFVCBIVU5HXCIsXCJiaXJ0aGRheVwiOm51bGwsXCJqb2JcIjpudWxsLFwiZ2VuZGVyXCI6bnVsbCxcInN5bmlkXCI6bnVsbCxcImF2YXRhclVybFwiOm51bGwsXCJjbW5kXCI6XCIwNzkwNzcwMjQ4NTZcIixcImFkZHJlc3NcIjpcIjg3LzQgVHLhuqduIMSQw6xuaCBYdSBUUEhDTVwiLFwiZW1haWxcIjpcImh1bmd0djIzNkBnbWFpbC5jb21cIixcInJlZ2lzdGVyRGF0ZVwiOjE2MzI3MDk5NTMwMDAsXCJzZXNzaW9uSWRcIjpudWxsLFwiY2lmXCI6XCIzMDYxNDE1MlwiLFwibWJBY2NvdW50RGVmYXVsdFwiOm51bGwsXCJtYkVtYWlsXCI6bnVsbCxcIm1iRnVsbG5hbWVcIjpudWxsLFwibWJJZENhcmROb1wiOm51bGwsXCJ0b3RhbEJvdWdodEtlbm9PcmRlclwiOjB9IiwiZXhwIjoxNzgwMDM3MDEwfQ.Rs1rrKas4HU7i6ajZLOLFUgNiZQxLjRYe7_0FVpFbOm55hbcWh5L3E4oXZdV4_YtcFbSXjUrIkbqU2zMsEUc1g'

type DataSource = 'online' | 'offline' | 'none'

export default function VuaxsPage() {
  const [items, setItems] = useState<GroupHistory[]>([])
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [gameFilter, setGameFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [source, setSource] = useState<DataSource>('none')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<GroupHistory | null>(null)
  const [showSync, setShowSync] = useState(false)

  const load = useCallback(async (reset: boolean, f: StatusFilter, p: number) => {
    setLoading(true)
    setError('')

    try {
      // Thử API online trước
      const res = await fetchHistoryGroup(TOKEN, f, p)
      setItems(prev => reset ? res.items : [...prev, ...res.items])
      setTotal(res.total)
      setSource('online')
      setLastUpdated(new Date().toISOString())
    } catch {
      // Fallback: load từ DB
      try {
        const res = await fetchHistoryFromDB(p)
        setItems(prev => reset ? res.items : [...prev, ...res.items])
        setTotal(res.total)
        setSource('offline')
        setLastUpdated(res.lastUpdated)
      } catch (e: any) {
        setError(e.message || 'Không thể tải dữ liệu')
        setSource('none')
      }
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
    <>
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-red-600 text-white px-4 py-4 shadow-md sticky top-0 z-10">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Lịch Sử Mua Chung</h1>
                <p className="text-red-200 text-xs mt-0.5">TRUONG VIET HUNG · 84966020709</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSync(true)}
                  className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-2 rounded-lg transition flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync
                </button>
                <button
                  onClick={() => exportToCSV(filtered)}
                  disabled={filtered.length === 0}
                  className="bg-white/20 hover:bg-white/30 disabled:opacity-40 text-white text-sm px-3 py-2 rounded-lg transition flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  CSV
                </button>
              </div>
            </div>

            {/* Status bar: online/offline + cập nhật lúc */}
            <div className="flex items-center gap-2 mt-2">
              {source === 'online' && (
                <span className="flex items-center gap-1.5 text-xs bg-green-500/30 text-green-100 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                  Online
                </span>
              )}
              {source === 'offline' && (
                <span className="flex items-center gap-1.5 text-xs bg-yellow-500/30 text-yellow-100 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full" />
                  Offline
                </span>
              )}
              {lastUpdated && (
                <span className="text-xs text-red-200">
                  Cập nhật lúc {formatUpdatedAt(lastUpdated)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4">
          <StatsBar items={items} total={total} />

          <FilterBar
            filter={filter}
            onFilterChange={f => setFilter(f)}
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
            <div className="text-center py-16 text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm">Đang tải...</p>
            </div>
          ) : filtered.length === 0 && !loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Không có dữ liệu</div>
          ) : (
            Object.entries(grouped).map(([date, dayItems]) => (
              <div key={date} className="mb-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  {date}
                </div>
                {dayItems.map(item => (
                  <GroupCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedItem(item)}
                  />
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

      {selectedItem && (
        <GroupDetailModal
          groupId={selectedItem.id}
          groupName={selectedItem.name}
          token={TOKEN}
          onClose={() => setSelectedItem(null)}
          isOffline={source === 'offline'}
        />
      )}

      {showSync && (
        <SyncModal
          token={TOKEN}
          onClose={() => setShowSync(false)}
          onDone={() => {
            setShowSync(false)
            setPage(1)
            setItems([])
            load(true, filter, 1)
          }}
        />
      )}
    </>
  )
}
