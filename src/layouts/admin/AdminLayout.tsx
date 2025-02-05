import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  History, 
  Bell, 
  Settings, 
  LogOut, 
  Shield,
  Command
} from 'lucide-react'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { rconAuth } from '@/lib/rcon-auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const menuItems = [
  { icon: LayoutDashboard, label: 'HomeBase', path: '/admin' },
  { icon: Users, label: 'Korisnici', path: '/admin/users' },
  { icon: History, label: 'AuditLogs', path: '/admin/audit-logs' },
  { icon: Bell, label: 'Obavještenja', path: '/admin/notifications' },
  { icon: Settings, label: 'Postavke', path: '/admin/settings' },
  { icon: Command, label: 'RCON', path: '/admin/rcon' }
]

interface Props {
  children?: ReactNode
}

export function AdminLayout({ children }: Props) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      // Odjava iz Supabase
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Čišćenje RCON autorizacije
      rconAuth.clearAuth()
      
      toast.success('Uspješno ste se odjavili')
      navigate('/')
    } catch (error) {
      console.error('Greška pri odjavi:', error)
      toast.error('Došlo je do greške pri odjavi')
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-64 bg-slate-800/50 backdrop-blur-xl border-r border-white/10"
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <Link to="/" className="block">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              KorepApp
            </h1>
          </Link>
        </div>

        {/* Navigation */}
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
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-5 h-5" />
              </motion.div>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Admin Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 px-4 py-2 text-white">
            <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="font-medium">Administrator</div>
              <div className="text-sm text-gray-400">RCON pristup</div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="mt-4 w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Odjava</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-slate-800/50 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-end h-full px-6">
            <NotificationBell 
              notifications={[]}
              onMarkAllRead={() => {}}
            />
          </div>
        </header>

        {/* Content Area */}
        <motion.main
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-1 overflow-auto p-6"
        >
          {children || <Outlet />}
        </motion.main>
      </div>
    </div>
  )
} 