import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Settings, History, Database, BookOpen, Menu, ChevronDown, LogOut } from 'lucide-react';
import { MobileNav } from './MobileNav';
import { rconAuth } from '../../services/rconAuth';
import { Toaster } from 'sonner';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    {
      name: 'Korisnici',
      href: '/admin/users',
      icon: Users,
      description: 'Upravljajte korisnicima sistema'
    },
    {
      name: 'Zbornica',
      href: '/admin/staffroom',
      icon: Database,
      description: 'Pregledajte podatke zbornice'
    },
    {
      name: 'Historija',
      href: '/admin/history',
      icon: History,
      description: 'Pregledajte historiju aktivnosti'
    },
    {
      name: 'Podešavanja',
      href: '/admin/settings',
      icon: Settings,
      description: 'Upravljajte podešavanjima sistema'
    }
  ];

  const handleSignOut = async () => {
    try {
      rconAuth.clearAuthorization();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Toaster richColors position="top-right" />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-800/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin" className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">Admin Panel</span>
            </Link>

            <div className="hidden lg:flex items-center space-x-4">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Odjavi se</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-400" />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        navigation={navigation}
        currentPath={location.pathname}
      />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}; 