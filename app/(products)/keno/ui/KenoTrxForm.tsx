'use client';

import { useState } from 'react';
import { KenoTrxForm } from '@/app/lib/kenotrx/definitions';

const TICKETS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;
const ALL_NUMS = Array.from({ length: 80 }, (_, i) => i + 1);
const GIA_OPTIONS = [10, 20, 30, 40, 50];

type TicketKey = typeof TICKETS[number];

interface Props {
  defaultValues: Partial<KenoTrxForm>;
  defaultKy: string;
  onSubmit: (form: KenoTrxForm) => Promise<void>;
  isEdit?: boolean;
  id?: string;
}

function NumPicker({
  selected,
  onChange,
  onClose,
}: {
  selected: number[];
  onChange: (nums: number[]) => void;
  onClose: () => void;
}) {
  const [nums, setNums] = useState<number[]>(selected);

  function toggle(n: number) {
    setNums(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n].sort((a, b) => a - b)
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-4 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Chọn số ({nums.length} số)</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Grid số */}
        <div className="grid grid-cols-10 gap-1 mb-3">
          {ALL_NUMS.map(n => (
            <button
              key={n}
              type="button"
              onClick={() => toggle(n)}
              className={`w-7 h-7 text-xs rounded font-mono font-bold transition-colors
                ${nums.includes(n)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {String(n).padStart(2, '0')}
            </button>
          ))}
        </div>

        {/* Selected */}
        <div className="text-xs text-gray-500 mb-3 min-h-[20px]">
          {nums.length > 0 ? nums.map(n => String(n).padStart(2, '0')).join(' - ') : 'Chưa chọn số nào'}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setNums([])}
            className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => { onChange(nums); onClose(); }}
            className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KenoTrxFormComponent({ defaultValues, defaultKy, onSubmit, isEdit, id }: Props) {
  const [tuKy, setTuKy] = useState(defaultValues.tu_ky || defaultKy);
  const [soKy, setSoKy] = useState(defaultValues.so_ky || 1);
  const [activeTickets, setActiveTickets] = useState<TicketKey[]>(() => {
    const active: TicketKey[] = [];
    for (const t of TICKETS) {
      if (defaultValues[`so_chon_${t}` as keyof KenoTrxForm]) active.push(t);
    }
    return active.length > 0 ? active : ['a', 'b', 'c'];
  });

  const [soChon, setSoChon] = useState<Record<TicketKey, number[]>>(() => {
    const result: Record<string, number[]> = {};
    for (const t of TICKETS) {
      const s = defaultValues[`so_chon_${t}` as keyof KenoTrxForm] as string;
      result[t] = s ? s.trim().split(/\s+/).map(Number).filter(Boolean) : [];
    }
    return result as Record<TicketKey, number[]>;
  });

  const [gia, setGia] = useState<Record<TicketKey, number>>(() => {
    const result: Record<string, number> = {};
    for (const t of TICKETS) {
      result[t] = (defaultValues[`gia_${t}` as keyof KenoTrxForm] as number) || 10;
    }
    return result as Record<TicketKey, number>;
  });

  const [pickerTicket, setPickerTicket] = useState<TicketKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function addTicket() {
    const next = TICKETS.find(t => !activeTickets.includes(t));
    if (next) setActiveTickets(prev => [...prev, next]);
  }

  function removeTicket(t: TicketKey) {
    setActiveTickets(prev => prev.filter(x => x !== t));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const form: KenoTrxForm = {
      tu_ky: tuKy,
      so_ky: soKy,
      so_chon_a: soChon.a.map(n => String(n).padStart(2, '0')).join(' '),
      gia_a: gia.a,
      so_chon_b: soChon.b.map(n => String(n).padStart(2, '0')).join(' '),
      gia_b: gia.b,
      so_chon_c: soChon.c.map(n => String(n).padStart(2, '0')).join(' '),
      gia_c: gia.c,
      so_chon_d: soChon.d.map(n => String(n).padStart(2, '0')).join(' '),
      gia_d: gia.d,
      so_chon_e: soChon.e.map(n => String(n).padStart(2, '0')).join(' '),
      gia_e: gia.e,
      so_chon_f: soChon.f.map(n => String(n).padStart(2, '0')).join(' '),
      gia_f: gia.f,
      status: 'buy',
    };

    if (isEdit && id) (form as any).id = id;
    await onSubmit(form);
    setSubmitting(false);
  }

  return (
    <>
      {pickerTicket && (
        <NumPicker
          selected={soChon[pickerTicket]}
          onChange={(nums) => setSoChon(prev => ({ ...prev, [pickerTicket]: nums }))}
          onClose={() => setPickerTicket(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ID (chỉ show khi edit) */}
        {isEdit && id && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 w-20">ID:</label>
            <span className="font-bold text-blue-700 font-mono">{id}</span>
          </div>
        )}

        {/* Tu ky */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 w-20">Từ kỳ:</label>
          <input
            type="text"
            value={tuKy}
            onChange={e => setTuKy(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm font-mono w-28"
            maxLength={7}
          />
        </div>

        {/* So ky */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 w-20">Số kỳ:</label>
          <input
            type="number"
            min={1}
            max={100}
            value={soKy}
            onChange={e => setSoKy(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
          />
        </div>

        {/* Tickets */}
        <div>
          <label className="text-sm text-gray-600 block mb-2">Dãy số:</label>
          <div className="space-y-2">
            {activeTickets.map(t => (
              <div key={t} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                {/* Label */}
                <span className="font-bold text-gray-700 w-5 text-sm">{t.toUpperCase()}</span>

                {/* So chon button */}
                <button
                  type="button"
                  onClick={() => setPickerTicket(t)}
                  className="flex-1 text-left px-2 py-1 border border-gray-300 rounded text-xs font-mono bg-white hover:bg-blue-50 min-h-[28px]"
                >
                  {soChon[t].length > 0
                    ? soChon[t].map(n => String(n).padStart(2, '0')).join(' - ')
                    : <span className="text-gray-400">Click để chọn số...</span>
                  }
                </button>

                {/* Gia */}
                <select
                  value={gia[t]}
                  onChange={e => setGia(prev => ({ ...prev, [t]: Number(e.target.value) }))}
                  className="border border-gray-300 rounded px-1 py-1 text-xs w-16"
                >
                  {GIA_OPTIONS.map(g => (
                    <option key={g} value={g}>{g}k</option>
                  ))}
                </select>

                {/* Remove */}
                {activeTickets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicket(t)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            {/* Add ticket */}
            {activeTickets.length < TICKETS.length && (
              <button
                type="button"
                onClick={addTicket}
                className="px-3 py-1.5 text-xs border border-dashed border-gray-400 rounded text-gray-500 hover:bg-gray-50 w-full"
              >
                + Thêm dãy
              </button>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Đang lưu...' : isEdit ? '💾 Cập nhật' : '💾 Tạo vé'}
          </button>
          <a href="/keno/trx" className="px-4 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50">
            Huỷ
          </a>
        </div>
      </form>
    </>
  );
}
