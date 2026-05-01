import { Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Topbar({ onToggleSidebar, title }) {
  const { user } = useAuth()
  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U'

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-4 lg:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{user?.username}</p>
          <p className="text-xs text-gray-500 capitalize">
            {user?.role === 'admin' ? 'Administrator' : 'Direktor'}
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#1A4A8A] flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
      </div>
    </header>
  )
}
