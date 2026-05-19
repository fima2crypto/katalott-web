'use client'

import { StatusFilter } from '@/app/lib/vuaxs/types'

interface Props {
  filter: StatusFilter
  onFilterChange: (f: StatusFilter) => void
  gameFilter: string
  onGameFilterChange: (g: string) => void
  games: string[]
}

const TABS: { label: string; value: StatusFilter }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang mở', value: '1' },
  { label: 'Hoàn thành', value: '2' },
  { label: 'Đã huỷ', value: '3' },
]

export default function FilterBar({
  filter,
  onFilterChange,
  gameFilter,
  onGameFilterChange,
  games,
}: Props) {
  return (
    <div className="mb-4 space-y-2">
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => onFilterChange(tab.value)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === tab.value
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {games.length > 0 && (
        <select
          value={gameFilter}
          onChange={e => onGameFilterChange(e.target.value)}
          className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-sm text-gray-600 shadow-sm outline-none focus:border-red-300 transition"
        >
          <option value="">Tất cả game</option>
          {games.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      )}
    </div>
  )
}
