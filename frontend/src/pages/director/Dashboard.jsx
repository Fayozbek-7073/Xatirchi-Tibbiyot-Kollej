import { useState, useEffect } from 'react'
import { Users, CreditCard, AlertCircle, TrendingUp, Search, Filter } from 'lucide-react'
import StatCard from '../../components/ui/StatCard'
import ReadOnlyBanner from '../../components/ui/ReadOnlyBanner'
import { DebtBadge } from '../../components/ui/Badge'
import { SkeletonTable } from '../../components/ui/SkeletonRow'
import { getStudents } from '../../api/students'
import { getGroups } from '../../api/groups'
import { getFaculties } from '../../api/faculties'

const formatSum = (n) =>
  new Intl.NumberFormat('uz-UZ').format(Number(n) || 0) + ' so\'m'

export default function DirectorDashboard() {
  const [students, setStudents] = useState([])
  const [groups, setGroups] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterFaculty, setFilterFaculty] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [filterCourse, setFilterCourse] = useState('')

  useEffect(() => {
    Promise.all([getStudents(), getGroups(), getFaculties()])
      .then(([sRes, gRes, fRes]) => {
        setStudents(sRes.data)
        setGroups(gRes.data)
        setFaculties(fRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalContracts = students.reduce((s, st) => s + Number(st.contract_total), 0)
  const totalPaid = students.reduce((s, st) => s + Number(st.contract_paid), 0)
  const totalDebt = students.reduce((s, st) => s + Math.max(0, Number(st.contract_total) - Number(st.contract_paid)), 0)
  const collectionRate = totalContracts > 0 ? ((totalPaid / totalContracts) * 100).toFixed(1) : '0'

  const getGroup = (id) => groups.find((g) => g.id === id)
  const getFacultyName = (group) => faculties.find((f) => f.id === group?.faculty_id)?.name || '—'

  const filteredGroups = filterFaculty
    ? groups.filter((g) => String(g.faculty_id) === filterFaculty)
    : groups

  const filtered = students.filter((s) => {
    const group = getGroup(s.group_id)
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase())
    const matchFaculty = !filterFaculty || String(group?.faculty_id) === filterFaculty
    const matchGroup = !filterGroup || String(s.group_id) === filterGroup
    const matchCourse = !filterCourse || String(group?.course) === filterCourse
    return matchSearch && matchFaculty && matchGroup && matchCourse
  })

  // Faculty debt breakdown
  const facultyDebt = faculties.map((f) => {
    const fGroups = groups.filter((g) => g.faculty_id === f.id).map((g) => g.id)
    const fStudents = students.filter((s) => fGroups.includes(s.group_id))
    const debt = fStudents.reduce((acc, s) => acc + Math.max(0, Number(s.contract_total) - Number(s.contract_paid)), 0)
    return { name: f.name, debt, count: fStudents.length }
  }).filter((f) => f.count > 0)

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Umumiy ko'rinish — faqat ko'rish</p>
      </div>

      <ReadOnlyBanner />

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
          icon={TrendingUp}
          label="Yig'ish foizi"
          value={loading ? '—' : `${collectionRate}%`}
          subLabel="to'lov darajasi"
          iconBg="bg-green-100"
          iconColor="text-green-700"
        />
        <StatCard
          icon={CreditCard}
          label="Yig'ilgan"
          value={loading ? '—' : formatSum(totalPaid)}
          subLabel="to'langan summa"
          iconBg="bg-indigo-100"
          iconColor="text-indigo-700"
        />
        <StatCard
          icon={AlertCircle}
          label="Qolgan qarz"
          value={loading ? '—' : formatSum(totalDebt)}
          subLabel="to'lanmagan summa"
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* Debt by faculty */}
      {!loading && facultyDebt.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Yo'nalish bo'yicha qarz</h3>
          <div className="space-y-3">
            {facultyDebt.map((f) => (
              <div key={f.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{f.name}</span>
                  <span className="text-red-600 font-semibold">{formatSum(f.debt)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400 rounded-full transition-all"
                    style={{
                      width: totalDebt > 0 ? `${Math.min(100, (f.debt / totalDebt) * 100)}%` : '0%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="F.I.Sh. bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <select
          value={filterFaculty}
          onChange={(e) => { setFilterFaculty(e.target.value); setFilterGroup('') }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Barcha yo'nalishlar</option>
          {faculties.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Barcha guruhlar</option>
          {filteredGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Barcha kurslar</option>
          {[1, 2, 3, 4].map((c) => <option key={c} value={c}>{c}-kurs</option>)}
        </select>
      </div>

      {/* Students table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">Talabalar ({filtered.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">#</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">F.I.Sh.</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">Guruh / Kurs</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">Yo'nalish</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-right">To'langan</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-right">Qolgan qarz</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-center">Holat</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTable rows={6} cols={7} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="text-center py-12 text-sm text-gray-400">
                      Talabalar topilmadi
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((student, idx) => {
                  const group = getGroup(student.group_id)
                  const debt = Math.max(0, Number(student.contract_total) - Number(student.contract_paid))
                  return (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors last:border-0">
                      <td className="text-sm text-gray-500 px-4 py-3.5">{idx + 1}</td>
                      <td className="text-sm text-gray-900 font-medium px-4 py-3.5">{student.full_name}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-gray-900">{group?.name || '—'}</p>
                        <p className="text-xs text-gray-500">{group?.course}-kurs</p>
                      </td>
                      <td className="text-sm text-gray-700 px-4 py-3.5">{getFacultyName(group)}</td>
                      <td className="text-sm text-green-600 font-medium px-4 py-3.5 text-right">{formatSum(student.contract_paid)}</td>
                      <td className="text-sm text-red-600 font-medium px-4 py-3.5 text-right">{formatSum(debt)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <DebtBadge paid={Number(student.contract_paid)} total={Number(student.contract_total)} />
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
  )
}
