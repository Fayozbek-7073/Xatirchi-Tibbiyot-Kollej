import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, User } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/SkeletonRow'
import { DebtBadge } from '../../components/ui/Badge'
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../api/students'
import { getGroups } from '../../api/groups'
import { getFaculties } from '../../api/faculties'

const formatSum = (n) =>
  new Intl.NumberFormat('uz-UZ').format(Number(n) || 0) + ' so\'m'

export default function Students() {
  const [students, setStudents] = useState([])
  const [groups, setGroups] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterFaculty, setFilterFaculty] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'add', item: null })
  const [form, setForm] = useState({ full_name: '', group_id: '', contract_total: '' })
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null })
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [studRes, grpRes, facRes] = await Promise.all([
        getStudents(),
        getGroups(),
        getFaculties(),
      ])
      setStudents(studRes.data)
      setGroups(grpRes.data)
      setFaculties(facRes.data)
    } catch {
      setError('Ma\'lumotlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setForm({ full_name: '', group_id: groups[0]?.id || '', contract_total: '' })
    setModal({ open: true, mode: 'add', item: null })
  }

  function openEdit(item) {
    setForm({
      full_name: item.full_name,
      group_id: item.group_id,
      contract_total: String(item.contract_total),
    })
    setModal({ open: true, mode: 'edit', item })
  }

  async function handleSave() {
    if (!form.full_name.trim() || !form.group_id || !form.contract_total) return
    setSaving(true)
    try {
      const payload = {
        full_name: form.full_name.trim(),
        group_id: Number(form.group_id),
        contract_total: Number(form.contract_total),
      }
      if (modal.mode === 'add') {
        await createStudent(payload)
      } else {
        await updateStudent(modal.item.id, payload)
      }
      setModal({ open: false, mode: 'add', item: null })
      load()
    } catch {
      setError('Saqlashda xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteModal.item) return
    try {
      await deleteStudent(deleteModal.item.id)
      setDeleteModal({ open: false, item: null })
      load()
    } catch {
      setError('O\'chirishda xatolik yuz berdi')
    }
  }

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
    return matchSearch && matchFaculty && matchGroup
  })

  const debt = (s) => (Number(s.contract_total) - Number(s.contract_paid))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Talabalar</h2>
          <p className="text-sm text-gray-500 mt-0.5">Jami {students.length} ta talaba</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#1A4A8A] hover:bg-[#153D75] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Talaba qo'shish
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="F.I.Sh. bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">#</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">F.I.Sh.</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">Guruh / Yo'nalish</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-right">Kontrakt</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-right">To'langan</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-right">Qarz</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-center">Holat</th>
                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTable rows={6} cols={8} />
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={User}
                  title="Talabalar yo'q"
                  description="Hali hech qanday talaba qo'shilmagan yoki filtr bo'yicha topilmadi"
                  action="Talaba qo'shish"
                  onAction={openAdd}
                />
              ) : (
                filtered.map((student, idx) => {
                  const group = getGroup(student.group_id)
                  const d = debt(student)
                  return (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors last:border-0">
                      <td className="text-sm text-gray-500 px-4 py-3.5">{idx + 1}</td>
                      <td className="text-sm text-gray-900 font-medium px-4 py-3.5">{student.full_name}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-gray-900">{group?.name || '—'}</p>
                        <p className="text-xs text-gray-500">{getFacultyName(group)} · {group?.course}-kurs</p>
                      </td>
                      <td className="text-sm text-gray-700 px-4 py-3.5 text-right">{formatSum(student.contract_total)}</td>
                      <td className="text-sm text-green-600 font-medium px-4 py-3.5 text-right">{formatSum(student.contract_paid)}</td>
                      <td className="text-sm text-red-600 font-medium px-4 py-3.5 text-right">{formatSum(d > 0 ? d : 0)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <DebtBadge paid={Number(student.contract_paid)} total={Number(student.contract_total)} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => openEdit(student)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteModal({ open: true, item: student })} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: 'add', item: null })}
        title={modal.mode === 'add' ? 'Talaba qo\'shish' : 'Talabani tahrirlash'}
        footer={
          <>
            <button onClick={() => setModal({ open: false, mode: 'add', item: null })} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm">
              Bekor qilish
            </button>
            <button onClick={handleSave} disabled={saving} className="bg-[#1A4A8A] hover:bg-[#153D75] disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">F.I.Sh.</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Familiya Ism Sharif"
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Guruh</label>
            <select
              value={form.group_id}
              onChange={(e) => setForm({ ...form, group_id: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Guruhni tanlang</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.course}-kurs)</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kontrakt summasi (so'm)</label>
            <input
              type="number"
              min="0"
              value={form.contract_total}
              onChange={(e) => setForm({ ...form, contract_total: e.target.value })}
              placeholder="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">To'lovlar "To'lovlar" bo'limida kiritiladi</p>
          </div>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        title="O'chirishni tasdiqlang"
        footer={
          <>
            <button onClick={() => setDeleteModal({ open: false, item: null })} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm">
              Bekor qilish
            </button>
            <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
              Ha, o'chirish
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">"{deleteModal.item?.full_name}"</span> talabani ro'yxatdan o'chirishni tasdiqlaysizmi?
        </p>
      </Modal>
    </div>
  )
}
