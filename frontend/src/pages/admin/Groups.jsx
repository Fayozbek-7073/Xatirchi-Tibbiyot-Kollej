import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/SkeletonRow'
import { getGroups, createGroup, updateGroup, deleteGroup } from '../../api/groups'
import { getFaculties } from '../../api/faculties'

const COURSES = [1, 2, 3, 4]

export default function Groups() {
  const [groups, setGroups] = useState([])
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'add', item: null })
  const [form, setForm] = useState({ name: '', faculty_id: '', course: '' })
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null })
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [groupsRes, facultiesRes] = await Promise.all([getGroups(), getFaculties()])
      setGroups(groupsRes.data)
      setFaculties(facultiesRes.data)
    } catch {
      setError('Ma\'lumotlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setForm({ name: '', faculty_id: faculties[0]?.id || '', course: '1' })
    setModal({ open: true, mode: 'add', item: null })
  }

  function openEdit(item) {
    setForm({ name: item.name, faculty_id: item.faculty_id, course: String(item.course) })
    setModal({ open: true, mode: 'edit', item })
  }

  async function handleSave() {
    if (!form.name.trim() || !form.faculty_id || !form.course) return
    setSaving(true)
    try {
      const payload = { name: form.name.trim(), faculty_id: Number(form.faculty_id), course: Number(form.course) }
      if (modal.mode === 'add') {
        await createGroup(payload)
      } else {
        await updateGroup(modal.item.id, payload)
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
      await deleteGroup(deleteModal.item.id)
      setDeleteModal({ open: false, item: null })
      load()
    } catch {
      setError('O\'chirishda xatolik yuz berdi')
    }
  }

  const getFacultyName = (id) => faculties.find((f) => f.id === id)?.name || '—'

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    getFacultyName(g.faculty_id).toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Guruhlar</h2>
          <p className="text-sm text-gray-500 mt-0.5">Jami {groups.length} ta guruh</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#1A4A8A] hover:bg-[#153D75] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Guruh qo'shish
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Guruh qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">#</th>
              <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">Guruh nomi</th>
              <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">Yo'nalish</th>
              <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">Kurs</th>
              <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonTable rows={5} cols={5} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Guruhlar yo'q"
                description="Hali hech qanday guruh qo'shilmagan"
                action="Guruh qo'shish"
                onAction={openAdd}
              />
            ) : (
              filtered.map((group, idx) => (
                <tr key={group.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors last:border-0">
                  <td className="text-sm text-gray-500 px-4 py-3.5">{idx + 1}</td>
                  <td className="text-sm text-gray-900 font-medium px-4 py-3.5">{group.name}</td>
                  <td className="text-sm text-gray-700 px-4 py-3.5">{getFacultyName(group.faculty_id)}</td>
                  <td className="text-sm text-gray-700 px-4 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {group.course}-kurs
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(group)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteModal({ open: true, item: group })} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: 'add', item: null })}
        title={modal.mode === 'add' ? 'Guruh qo\'shish' : 'Guruhni tahrirlash'}
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
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Guruh nomi</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Masalan: 101-guruh"
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Yo'nalish</label>
            <select
              value={form.faculty_id}
              onChange={(e) => setForm({ ...form, faculty_id: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Yo'nalishni tanlang</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kurs</label>
            <select
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>{c}-kurs</option>
              ))}
            </select>
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
          <span className="font-semibold text-gray-900">"{deleteModal.item?.name}"</span> guruhini o'chirishni tasdiqlaysizmi?
        </p>
      </Modal>
    </div>
  )
}
