import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  GraduationCap,
  Settings,
  LogOut
} from 'lucide-react';
import { UserProfile } from '../../components/shared/UserProfile';
import { NotificationBell } from '../../components/shared/NotificationBell';

const menuItems = [
  { icon: Home, label: 'HomeBase', path: '/professor' },
  { icon: BookOpen, label: 'Dnevnik', path: '/professor/diary' },
  { icon: Calendar, label: 'Kalendar', path: '/professor/calendar' },
  { icon: GraduationCap, label: 'Korepeticija', path: '/professor/tutoring' },
];

const sidebarVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const ProfessorLayout: React.FC = () => {
  const location = useLocation();

  // Mock data
  const mockNotifications = [
    {
      id: '1',
      title: 'Novi termin',
      message: 'Imate novi termin za korepeticiju.',
      time: 'Danas u 15:00',
      read: false
    }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
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
              end={item.path === '/professor'}
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

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <UserProfile
            name="Profesor"
            role="Predavač"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center space-x-4">
              <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
            </div>
            <NotificationBell 
              notifications={mockNotifications}
              onMarkAllRead={() => {}}
            />
          </div>
        </header>

        {/* Content Area */}
        <motion.main
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 overflow-auto p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}; 