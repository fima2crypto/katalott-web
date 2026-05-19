'use client'

import { GroupHistory } from '@/app/lib/vuaxs/types'
import { getStatusLabel, parseGameName } from '@/app/lib/vuaxs/api'

interface Props {
  item: GroupHistory
}

const statusColors: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-gray-100 text-gray-500 border-gray-200',
}

export default function GroupCard({ item }: Props) {
  const { label, color } = getStatusLabel(item.groupStatus)
  const { game, type } = parseGameName(item.name)
  const isWin = item.statusWin === 1

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-2 p-4 flex gap-3">
      {/* Left badge */}
      <div className="flex flex-col items-center min-w-[76px]">
        <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg w-full text-center mb-1 leading-tight">
          {game}
        </div>
        <div className="text-sm font-semibold text-gray-800 text-center">{type}</div>
        <div className="text-xs text-blue-600 mt-1">Góp {item.percentageOfShares}%</div>
      </div>

      <div className="w-px bg-gray-100 self-stretch" />

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-sm font-semibold text-gray-800">#{item.id}</span>
          <div className="flex items-center gap-1.5">
            {isWin && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-yellow-50 text-yellow-700 border-yellow-200">
                🏆 Thắng
              </span>
            )}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[color]}`}>
              {label} {Math.round(item.procress)}%
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-500">
            Kỳ: <span className="text-gray-700 font-medium">#{item.drawInfo.drawId}</span>
            <span className="ml-1 text-gray-400">· {item.drawInfo.openDate}</span>
          </div>
          <div className="text-xs text-gray-500">
            Thành viên: <span className="text-gray-700 font-medium">{item.numberOfMembers}</span>
            <span className="mx-1 text-gray-300">·</span>
            Vé: <span className="text-gray-700 font-medium">{item.numberOfTickets}</span>
          </div>
          <div className="text-xs text-gray-500">
            Tiền góp:{' '}
            <span className="text-gray-700 font-medium">
              {item.moneyOfShares.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Đóng: <span className="text-gray-700">{item.timeCutOff}</span>
          </div>
          {item.prizeWinAfterTax > 0 && (
            <div className="text-xs text-green-600 font-medium">
              Giải: {item.prizeWinAfterTax.toLocaleString('vi-VN')}đ (sau thuế)
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-2.5">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, item.procress)}%`,
                background: item.procress >= 100 ? '#16a34a' : '#e53935',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
