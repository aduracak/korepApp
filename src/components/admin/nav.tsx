import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  History, 
  Bell, 
  Settings,
  Command
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'HomeBase', path: '/admin' },
  { icon: Users, label: 'Korisnici', path: '/admin/users' },
  { icon: History, label: 'AuditLogs', path: '/admin/audit-logs' },
  { icon: Bell, label: 'Obavještenja', path: '/admin/notifications' },
  { icon: Settings, label: 'Postavke', path: '/admin/settings' },
  { icon: Command, label: 'RCON', path: '/admin/rcon' }
]

export function AdminNav() {
  return (
    <nav className="p-4 space-y-2">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/admin'}
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
} 