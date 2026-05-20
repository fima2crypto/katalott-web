'use client'

import { useState } from 'react'

interface Props {
  token: string
  onClose: () => void
  onDone?: () => void
}

interface SyncResult {
  total: number
  synced: number
  skipped: number
  errors: number
}

export default function SyncModal({ token, onClose, onDone }: Props) {
  const [fromDate, setFromDate] = useState(() => {
    // Default: đầu tháng hiện tại
    const now = new Date()
    return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState('')

  const handleSync = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/vuaxs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, fromDate }),
      })

      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Lỗi sync')

      setResult(data)
      onDone?.()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">Sync dữ liệu</h2>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
            ✕
          </button>
        </div>

        {/* From date */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">
            Sync từ ngày (dd/mm/yyyy)
          </label>
          <input
            type="text"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            placeholder="01/05/2026"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-300 transition"
          />
          <p className="text-xs text-gray-400 mt-1">
            Chỉ sync các nhóm từ ngày này trở đi
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-3 py-2.5 mb-3">
            ⚠️ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-3 space-y-1">
            <p className="text-sm font-semibold text-green-700">✅ Sync hoàn tất!</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { label: 'Đã lưu', value: result.synced, color: 'text-green-600' },
                { label: 'Bỏ qua', value: result.skipped, color: 'text-gray-500' },
                { label: 'Lỗi', value: result.errors, color: 'text-red-500' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSync}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
              Đang sync...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Bắt đầu Sync
            </>
          )}
        </button>
      </div>
    </div>
  )
}
