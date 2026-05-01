import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, GraduationCap } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonTable } from '../../components/ui/SkeletonRow'
import { getFaculties, createFaculty, updateFaculty, deleteFaculty } from '../../api/faculties'

export default function Faculties() {
  const [faculties, setFaculties] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'add', item: null })
  const [formName, setFormName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null })
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getFaculties()
      setFaculties(data)
    } catch {
      setError('Ma\'lumotlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setFormName('')
    setModal({ open: true, mode: 'add', item: null })
  }

  function openEdit(item) {
    setFormName(item.name)
    setModal({ open: true, mode: 'edit', item })
  }

  async function handleSave() {
    if (!formName.trim()) return
    setSaving(true)
    try {
      if (modal.mode === 'add') {
        await createFaculty({ name: formName.trim() })
      } else {
        await updateFaculty(modal.item.id, { name: formName.trim() })
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
      await deleteFaculty(deleteModal.item.id)
      setDeleteModal({ open: false, item: null })
      load()
    } catch {
      setError('O\'chirishda xatolik yuz berdi')
    }
  }

  const filtered = faculties.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Yo'nalishlar</h2>
          <p className="text-sm text-gray-500 mt-0.5">Jami {faculties.length} ta yo'nalish</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#1A4A8A] hover:bg-[#153D75] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yo'nalish qo'shish
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Yo'nalish qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">#</th>
              <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-left">Yo'nalish nomi</th>
              <th className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonTable rows={5} cols={3} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title="Yo'nalishlar yo'q"
                description="Hali hech qanday yo'nalish qo'shilmagan"
                action="Yo'nalish qo'shish"
                onAction={openAdd}
              />
            ) : (
              filtered.map((faculty, idx) => (
                <tr key={faculty.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors last:border-0">
                  <td className="text-sm text-gray-500 px-4 py-3.5">{idx + 1}</td>
                  <td className="text-sm text-gray-900 font-medium px-4 py-3.5">{faculty.name}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(faculty)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Tahrirlash"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, item: faculty })}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                        title="O'chirish"
                      >
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
        title={modal.mode === 'add' ? 'Yo\'nalish qo\'shish' : 'Yo\'nalishni tahrirlash'}
        footer={
          <>
            <button
              onClick={() => setModal({ open: false, mode: 'add', item: null })}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formName.trim()}
              className="bg-[#1A4A8A] hover:bg-[#153D75] disabled:opacity-60 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </>
        }
      >
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Yo'nalish nomi
          </label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Masalan: Hamshiralik ishi"
            autoFocus
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        title="O'chirishni tasdiqlang"
        footer={
          <>
            <button
              onClick={() => setDeleteModal({ open: false, item: null })}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Ha, o'chirish
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">"{deleteModal.item?.name}"</span> yo'nalishini o'chirishni tasdiqlaysizmi?
          Bu amalni qaytarib bo'lmaydi.
        </p>
      </Modal>
    </div>
  )
}
