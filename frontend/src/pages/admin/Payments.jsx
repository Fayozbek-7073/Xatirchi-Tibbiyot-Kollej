import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, CreditCard, CheckCircle2 } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/SkeletonRow'
import { getPayments, createPayment } from '../../api/payments'
import { getStudents } from '../../api/students'

const formatSum = (n) =>
  new Intl.NumberFormat('uz-UZ').format(Number(n) || 0) + ' so\'m'

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ student_id: '', amount: '' })
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [payRes, studRes] = await Promise.all([getPayments(), getStudents()])
      setPayments(payRes.data)
      setStudents(studRes.data)
    } catch {
      setError('Ma\'lumotlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setForm({ student_id: '', amount: '' })
    setSelectedStudent(null)
    setModal(true)
  }

  function handleStudentChange(id) {
    const s = students.find((st) => String(st.id) === id)
    setForm({ student_id: id, amount: '' })
    setSelectedStudent(s || null)
  }

  async function handleSave() {
    if (!form.student_id || !form.amount || Number(form.amount) <= 0) return
    setSaving(true)
    try {
      await createPayment({ student_id: Number(form.student_id), amount: Number(form.amount) })
      setModal(false)
      load()
    } catch {
      setError('To\'lov qo\'shishda xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const getStudentName = (p) =>
    p.student_name || students.find((s) => s.id === p.student_id)?.full_name || '—'

  const filtered = payments.filter((p) => {
    const name = getStudentName(p)
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const totalCollected = payments.reduce((acc, p) => acc + Number(p.amount), 0)

  const remainingDebt = selectedStudent
    ? Math.max(0, Number(selectedStudent.contract_total) - Number(selectedStudent.contract_paid))
    : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">To'lovlar</h2>
          <p className="text-sm text-gray-500 mt-0.5">Jami yig'ilgan: {formatSum(totalCollected)}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#1A4A8A] hover:bg-[#153D75] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          To'lov qo'shish
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Talaba nomi bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">#</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">Talaba</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-right">To'lov miqdori</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">Sana</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTable rows={5} cols={4} />
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="To'lovlar yo'q"
                  description="Hali hech qanday to'lov kiritilmagan"
                  action="To'lov qo'shish"
                  onAction={openAdd}
                />
              ) : (
                filtered.map((payment, idx) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors last:border-0">
                    <td className="text-sm text-gray-500 px-4 py-3.5">{idx + 1}</td>
                    <td className="text-sm text-gray-900 font-medium px-4 py-3.5">
                      {getStudentName(payment)}
                    </td>
                    <td className="text-sm text-green-600 font-semibold px-4 py-3.5 text-right">
                      +{formatSum(payment.amount)}
                    </td>
                    <td className="text-sm text-gray-500 px-4 py-3.5">
                      {formatDate(payment.created_at || payment.date || new Date())}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add payment modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="To'lov qo'shish"
        footer={
          <>
            <button onClick={() => setModal(false)} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm">
              Bekor qilish
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.student_id || !form.amount || Number(form.amount) <= 0 || remainingDebt === 0}
              className="bg-[#1A4A8A] hover:bg-[#153D75] disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {saving ? 'Saqlanmoqda...' : 'To\'lovni qo\'shish'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Talaba</label>
            <select
              value={form.student_id}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              autoFocus
            >
              <option value="">Talabani tanlang</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>

          {/* Student debt info */}
          {selectedStudent && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Umumiy kontrakt:</span>
                <span className="font-medium text-gray-900">{formatSum(selectedStudent.contract_total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">To'langan:</span>
                <span className="font-medium text-green-600">{formatSum(selectedStudent.contract_paid)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-blue-200 pt-2">
                <span className="text-gray-600 font-medium">Qolgan qarz:</span>
                <span className={`font-bold ${remainingDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {remainingDebt > 0 ? formatSum(remainingDebt) : (
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> To'liq to'langan</span>
                  )}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">To'lov miqdori (so'm)</label>
            <input
              type="number"
              min="1"
              max={remainingDebt !== null ? remainingDebt : undefined}
              disabled={remainingDebt === 0}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder={remainingDebt === 0 ? 'Qarz yo\'q' : '0'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
            {remainingDebt !== null && form.amount && remainingDebt > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                To'lovdan keyin qolgan qarz: {formatSum(Math.max(0, remainingDebt - Number(form.amount)))}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
