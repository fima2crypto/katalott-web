'use client'

import { GroupHistory } from '@/app/lib/vuaxs/types'
import { getStatusLabel, parseGameName } from '@/app/lib/vuaxs/api'

interface Props {
  item: GroupHistory
  onClick: () => void
}

const statusColors: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-gray-100 text-gray-500 border-gray-200',
}

function MiniBall({ n }: { n: number }) {
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ background: 'linear-gradient(145deg, #f87171, #dc2626)' }}>
      {n}
    </div>
  )
}

export default function GroupCard({ item, onClick }: Props) {
  const { label, color } = getStatusLabel(item.groupStatus)
  const { game, type } = parseGameName(item.name)
  const isWin = item.statusWin === 1
  const isComplete = item.groupStatus === 2 && Math.round(item.procress) === 100
  const hasNumbers = isComplete && item.numberFinish && item.numberFinish.length > 0

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-2 p-4 flex gap-3 cursor-pointer hover:shadow-md hover:border-red-100 active:scale-[0.99] transition-all"
    >
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
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isWin && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-yellow-50 text-yellow-700 border-yellow-200">
                🏆 Thắng
              </span>
            )}
            {/* Icon ảnh vé - chỉ hiện khi hoàn thành 100% */}
            {isComplete && (
              item.ticketImagePath
                ? <span title="Có ảnh vé" className="text-base">🎫</span>
                : <span title="Chưa có ảnh vé" className="text-base opacity-30">📋</span>
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
            TV: <span className="text-gray-700 font-medium">{item.numberOfMembers}</span>
            <span className="mx-1 text-gray-300">·</span>
            Vé: <span className="text-gray-700 font-medium">{item.numberOfTickets}</span>
            <span className="mx-1 text-gray-300">·</span>
            <span className="text-gray-700 font-medium">{item.moneyOfShares.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="text-xs text-gray-500">
            Đóng: <span className="text-gray-700">{item.timeCutOff}</span>
          </div>
          {item.prizeWinAfterTax > 0 && (
            <div className="text-xs text-green-600 font-medium">
              🏆 {item.prizeWinAfterTax.toLocaleString('vi-VN')}đ
            </div>
          )}
        </div>

        {/* Bộ số final - chỉ hiện khi hoàn thành 100% và có data từ DB */}
        {hasNumbers && (
          <div className="mt-2.5 flex gap-1.5 flex-wrap">
            {item.numberFinish!.map((n, i) => (
              <MiniBall key={i} n={n} />
            ))}
          </div>
        )}

        {/* Progress bar - chỉ hiện khi chưa hoàn thành */}
        {!isComplete && (
          <div className="mt-2.5">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, item.procress)}%`,
                  background: '#e53935',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Chevron */}
      <div className="self-center text-gray-300 flex-shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}
