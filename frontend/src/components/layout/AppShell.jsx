import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const pageTitles = {
  '/admin': 'Bosh sahifa',
  '/admin/faculties': 'Yo\'nalishlar',
  '/admin/groups': 'Guruhlar',
  '/admin/students': 'Talabalar',
  '/admin/payments': 'To\'lovlar',
  '/director': 'Dashboard',
}

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Xatirchi'

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB]">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
