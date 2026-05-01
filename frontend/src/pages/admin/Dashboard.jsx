import { useState, useEffect } from 'react'
import { Users, CreditCard, TrendingUp, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/ui/StatCard'
import { DebtBadge } from '../../components/ui/Badge'
import { getStudents } from '../../api/students'

const formatSum = (n) =>
  new Intl.NumberFormat('uz-UZ').format(Number(n) || 0) + ' so\'m'

export default function AdminDashboard() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getStudents()
      .then(({ data }) => setStudents(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalContracts = students.reduce((s, st) => s + Number(st.contract_total), 0)
  const totalPaid = students.reduce((s, st) => s + Number(st.contract_paid), 0)
  const totalDebt = students.reduce((s, st) => s + Math.max(0, Number(st.contract_total) - Number(st.contract_paid)), 0)

  const recentDebtors = [...students]
    .filter((s) => Number(s.contract_total) - Number(s.contract_paid) > 0)
    .slice(0, 8)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Bosh sahifa</h2>
        <p className="text-sm text-gray-500 mt-0.5">Umumiy ko'rinish</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Jami talabalar"
          value={loading ? '—' : students.length}
          subLabel="ro'yxatdagi talabalar"
          iconBg="bg-blue-100"
          iconColor="text-blue-700"
        />
        <StatCard
          icon={CreditCard}
          label="Jami kontrakt"
          value={loading ? '—' : formatSum(totalContracts)}
          subLabel="umumiy majburiyat"
          iconBg="bg-indigo-100"
          iconColor="text-indigo-700"
        />
        <StatCard
          icon={TrendingUp}
          label="Yig'ilgan summa"
          value={loading ? '—' : formatSum(totalPaid)}
          subLabel="to'langan"
          iconBg="bg-green-100"
          iconColor="text-green-700"
        />
        <StatCard
          icon={AlertCircle}
          label="Umumiy qarz"
          value={loading ? '—' : formatSum(totalDebt)}
          subLabel="to'lanmagan"
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => navigate('/admin/students')}
          className="flex items-center gap-2 bg-[#1A4A8A] hover:bg-[#153D75] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Users className="w-4 h-4" />
          Talabalar ro'yxati
        </button>
        <button
          onClick={() => navigate('/admin/payments')}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <CreditCard className="w-4 h-4" />
          To'lov qo'shish
        </button>
      </div>

      {/* Debtors table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Qarzdor talabalar</h3>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">F.I.Sh.</th>
                  <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-right">Kontrakt</th>
                  <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-right">To'langan</th>
                  <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-right">Qarz</th>
                  <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-center">Holat</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-sm text-gray-400">Yuklanmoqda...</td></tr>
                ) : recentDebtors.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-sm text-gray-400">Barcha talabalar to'lovini to'lagan!</td></tr>
                ) : (
                  recentDebtors.map((s) => {
                    const d = Math.max(0, Number(s.contract_total) - Number(s.contract_paid))
                    return (
                      <tr key={s.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors last:border-0">
                        <td className="text-sm text-gray-900 font-medium px-4 py-3.5">{s.full_name}</td>
                        <td className="text-sm text-gray-700 px-4 py-3.5 text-right">{formatSum(s.contract_total)}</td>
                        <td className="text-sm text-green-600 px-4 py-3.5 text-right">{formatSum(s.contract_paid)}</td>
                        <td className="text-sm text-red-600 font-semibold px-4 py-3.5 text-right">{formatSum(d)}</td>
                        <td className="px-4 py-3.5 text-center">
                          <DebtBadge paid={Number(s.contract_paid)} total={Number(s.contract_total)} />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
