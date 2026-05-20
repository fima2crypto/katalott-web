'use client'

import { useEffect, useState } from 'react'
import { GroupDetail, TicketInGroup } from '@/app/lib/vuaxs/types'
import { fetchGroupDetail, fetchGroupDetailFromDB, parseGameName } from '@/app/lib/vuaxs/api'

interface Props {
  groupId: number
  groupName: string
  token: string
  onClose: () => void
  isOffline?: boolean
}

function LottoBall({ n }: { n: number }) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0"
      style={{ background: 'linear-gradient(145deg, #f87171, #dc2626)' }}
    >
      {n}
    </div>
  )
}

function MemberRow({ ticket, index, isMe }: { ticket: TicketInGroup; index: number; isMe: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const phone = ticket.userId || `#${index + 1}`
  const masked = phone.length > 6
    ? phone.slice(0, 3) + '*'.repeat(phone.length - 5) + phone.slice(-2)
    : phone
  const numbers = ticket.numberInfos?.[0]?.numbers?.map(n => n.num) || []

  return (
    <div className={`border-t border-gray-100 ${isMe ? 'bg-purple-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
      <div
        className="grid px-4 py-3 cursor-pointer"
        style={{ gridTemplateColumns: '1fr auto auto auto' }}
        onClick={() => numbers.length > 0 && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-gray-600">#{index + 1}: {masked}</span>
          {isMe && (
            <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full font-medium">
              Bạn
            </span>
          )}
        </div>
        <span className="text-sm font-semibold text-gray-800 text-right mr-4">
          {ticket.moneyOfShares.toLocaleString('vi-VN')}đ
        </span>
        <span className="text-sm text-gray-500 text-right mr-2">{ticket.percentageOfShares}%</span>
        {numbers.length > 0 && (
          <span className="text-gray-300 text-xs self-center">{expanded ? '▲' : '▼'}</span>
        )}
      </div>

      {expanded && numbers.length > 0 && (
        <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
          {numbers.map((n, i) => (
            <div key={i}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ background: 'linear-gradient(145deg, #f87171, #dc2626)' }}
            >
              {n}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function GroupDetailModal({ groupId, groupName, token, onClose, isOffline }: Props) {
  const [detail, setDetail] = useState<GroupDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dataSource, setDataSource] = useState<'online' | 'offline' | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')

      if (isOffline) {
        // Đã biết offline → load DB luôn
        try {
          const data = await fetchGroupDetailFromDB(groupId)
          setDetail(data)
          setDataSource('offline')
        } catch (e: any) {
          setError(e.message)
        }
      } else {
        // Thử API trước, fallback DB
        try {
          const data = await fetchGroupDetail(token, groupId)
          setDetail(data)
          setDataSource('online')
        } catch {
          try {
            const data = await fetchGroupDetailFromDB(groupId)
            setDetail(data)
            setDataSource('offline')
          } catch (e: any) {
            setError('Không thể tải chi tiết: ' + e.message)
          }
        }
      }

      setLoading(false)
    }

    load()
  }, [groupId, token, isOffline])

  const { game, type } = parseGameName(groupName)
  const procress = detail?.procress ?? 0
  const isComplete = procress >= 100
  const finishNumbers = detail?.numberFinish?.map(n => n.num) || []
  const members = detail?.listTicketInGroup || []
  const myIndex = members.findIndex(m => m.currentMember === 1)

  // Ảnh: ưu tiên local path, fallback URL gốc
  const imageUrl = detail?.ticket_image_path
    ? `/api/vuaxs/ticket-image/${groupId}`
    : detail?.ticket_image || null

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />

      <div
        className="relative mt-auto w-full max-w-2xl mx-auto bg-gray-50 rounded-t-3xl max-h-[95vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Purple header */}
        <div className="sticky top-0 z-10 rounded-t-3xl"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
          <div className="flex items-center justify-between px-4 py-4">
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-white font-bold text-base tracking-wide">THÔNG TIN NHÓM</h2>
            {/* Online/Offline badge */}
            <div>
              {dataSource === 'online' && (
                <span className="flex items-center gap-1 text-[10px] bg-green-500/30 text-green-100 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full" />
                  Online
                </span>
              )}
              {dataSource === 'offline' && (
                <span className="flex items-center gap-1 text-[10px] bg-yellow-500/30 text-yellow-100 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full" />
                  Offline
                </span>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="animate-spin w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-400">Đang tải chi tiết...</p>
          </div>
        )}

        {error && (
          <div className="mx-4 my-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4">
            ⚠️ {error}
          </div>
        )}

        {detail && (
          <div className="px-4 pb-10 space-y-3 mt-3">
            {/* Title card */}
            <div className="bg-white rounded-2xl px-4 pt-5 pb-4 shadow-sm relative">
              <div
                className="absolute top-4 right-4 text-white rounded-xl px-3 py-2 text-center min-w-[76px]"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
              >
                <div className="text-[11px] opacity-80">Bạn đã góp</div>
                <div className="text-xl font-black">{detail.percentageOfShares}%</div>
              </div>

              <div className="pr-24">
                <div className="text-xl font-bold text-gray-800">
                  {type} <span className="text-purple-400 font-normal text-lg">#{groupId}</span>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Sản phẩm:</span> {game}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Kỳ quay:</span>{' '}
                    #{detail.drawInfo?.drawId} - {detail.drawInfo?.openDate?.split(' ')[0]}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-700">Thời gian đóng:</span>{' '}
                    {detail.timeCutOff}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-5 text-center">
                {isComplete && (
                  <p className="text-sm font-semibold text-gray-500 mb-1">Nhóm hoàn thành</p>
                )}
                <div className="flex items-end justify-center gap-1">
                  <span className="text-6xl font-black text-red-500 leading-none">
                    {Math.round(procress)}
                  </span>
                  <span className="text-3xl font-bold text-red-400 mb-1">%</span>
                </div>
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, procress)}%`,
                      background: isComplete ? '#16a34a' : '#ef4444',
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>{detail.numberOfMembers} thành viên</span>
                  <span>{detail.numberOfTickets} vé</span>
                  <span>{detail.moneyOfShares?.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {detail.prizeWinAfterTax > 0 && (
                <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <span className="text-sm text-green-600 font-medium">🏆 Giải thưởng (sau thuế)</span>
                  <span className="text-sm font-bold text-green-600">
                    {detail.prizeWinAfterTax.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              )}
            </div>

            {/* Bộ số kết quả */}
            {finishNumbers.length > 0 && (
              <div className="bg-white rounded-2xl px-4 py-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-700 mb-3">Bộ số của nhóm:</p>
                <div className="flex gap-2 flex-wrap">
                  {finishNumbers.map((n, i) => <LottoBall key={i} n={n} />)}
                </div>
              </div>
            )}

            {/* Ảnh vé */}
            {imageUrl && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <img src={imageUrl} alt="Vé số"
                  className="w-full object-contain max-h-56" />
              </div>
            )}

            {/* Danh sách thành viên */}
            {members.length > 0 && (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">
                    Danh sách thành viên ({members.length} người)
                  </span>
                  <span className="text-xs text-gray-400 ml-1">· Nhấn để xem bộ số</span>
                </div>

                <div className="grid px-4 py-2 bg-gray-50"
                  style={{ gridTemplateColumns: '1fr auto auto auto' }}>
                  <span className="text-xs font-medium text-gray-500">Thành viên</span>
                  <span className="text-xs font-medium text-gray-500 mr-4">Số tiền</span>
                  <span className="text-xs font-medium text-gray-500 mr-2">Góp</span>
                  <span className="w-3" />
                </div>

                {members.map((ticket, i) => (
                  <MemberRow key={ticket.id} ticket={ticket} index={i} isMe={i === myIndex} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
