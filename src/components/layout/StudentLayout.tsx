import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, GraduationCap, BookOpen, Clock, Star, Settings, Menu, ChevronDown, LogOut } from 'lucide-react';
import { MobileNav } from './MobileNav';
import { supabase } from '../../lib/supabase';

export const StudentLayout: React.FC = () => {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ first_name: string; last_name: string } | null>(null);
  const navigate = useNavigate();

  const navigation = [
    {
      name: 'Časovi',
      href: '/student/lessons',
      icon: Calendar
    },
    {
      name: 'Profesori',
      href: '/student/professors',
      icon: GraduationCap
    },
    {
      name: 'Predmeti',
      href: '/student/subjects',
      icon: BookOpen
    },
    {
      name: 'Historija',
      href: '/student/history',
      icon: Clock
    },
    {
      name: 'Ocjene',
      href: '/student/grades',
      icon: Star
    },
    {
      name: 'Podešavanja',
      href: '/student/settings',
      icon: Settings
    }
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-800/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/student" className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">Učenički Panel</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-4">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'bg-emerald-400/10 text-emerald-400'
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
              {/* Profile */}
              <div className="relative ml-auto">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 hover:bg-white/5 p-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium">
                    {userProfile ? userProfile.first_name[0] + userProfile.last_name[0] : ''}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Učitavanje...'}
                    </div>
                    <div className="text-xs text-gray-400">Učenik</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-white/10 py-1"
                  >
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:bg-white/5 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Odjavi se</span>
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Mobile Menu Button */}
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

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        navigation={navigation}
        currentPath={location.pathname}
      />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}; 