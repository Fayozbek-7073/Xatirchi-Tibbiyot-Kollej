import { NavLink, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  Users,
  User,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const adminLinks = [
  { to: '/admin', label: 'Bosh sahifa', icon: LayoutDashboard, end: true },
  { to: '/admin/faculties', label: 'Yo\'nalishlar', icon: GraduationCap },
  { to: '/admin/groups', label: 'Guruhlar', icon: Users },
  { to: '/admin/students', label: 'Talabalar', icon: User },
  { to: '/admin/payments', label: 'To\'lovlar', icon: CreditCard },
]

const directorLinks = [
  { to: '/director', label: 'Dashboard', icon: LayoutDashboard, end: true },
]

export default function Sidebar({ open, onToggle }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const links = user?.role === 'admin' ? adminLinks : directorLinks

  function handleSignOut() {
    signOut()
    navigate('/login')
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U'

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          bg-[#0D2B52] text-white transition-all duration-300
          ${open ? 'w-60' : 'w-0 lg:w-16'}
          lg:relative lg:translate-x-0
          ${!open ? '-translate-x-full lg:translate-x-0' : ''}
          overflow-hidden
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className={`font-bold text-sm leading-tight whitespace-nowrap overflow-hidden transition-all ${open ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:opacity-0'}`}>
            Xatirchi<br />tibbiyot
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1A4A8A] text-white'
                    : 'text-blue-200 hover:bg-[#1A4A8A]/60 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className={`whitespace-nowrap overflow-hidden transition-all ${open ? 'opacity-100' : 'opacity-0 w-0 lg:opacity-0'}`}>
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* User block */}
        <div className="p-3 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-[#1A4A8A] flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className={`flex-1 min-w-0 overflow-hidden transition-all ${open ? 'opacity-100' : 'opacity-0 w-0 lg:opacity-0'}`}>
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-blue-300 capitalize">{user?.role === 'admin' ? 'Administrator' : 'Direktor'}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-red-600/20 hover:text-red-300 transition-colors w-full mt-1`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`whitespace-nowrap overflow-hidden transition-all ${open ? 'opacity-100' : 'opacity-0 w-0 lg:opacity-0'}`}>
              Chiqish
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
