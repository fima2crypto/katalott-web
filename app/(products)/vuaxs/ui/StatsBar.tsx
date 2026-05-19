'use client'

import { GroupHistory } from '@/app/lib/vuaxs/types'

interface Props {
  items: GroupHistory[]
  total: number
}

export default function StatsBar({ items, total }: Props) {
  const done = items.filter(x => x.groupStatus === 2).length
  const open = items.filter(x => x.groupStatus === 1).length
  const cancelled = items.filter(x => x.groupStatus === 3).length
  const totalMoney = items.reduce((s, x) => s + x.moneyOfShares, 0)

  const stats = [
    { label: 'Tổng nhóm', value: total || items.length, color: 'text-gray-800' },
    { label: 'Hoàn thành', value: done, color: 'text-green-600' },
    { label: 'Đang mở', value: open, color: 'text-blue-600' },
    { label: 'Đã huỷ', value: cancelled, color: 'text-red-500' },
  ]

  return (
    <div className="mb-4">
      <div className="grid grid-cols-4 gap-2 mb-2">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      {totalMoney > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-center">
          <span className="text-xs text-red-400">Tổng tiền đã góp (trang này): </span>
          <span className="text-sm font-semibold text-red-600">
            {totalMoney.toLocaleString('vi-VN')}đ
          </span>
        </div>
      )}
    </div>
  )
}
