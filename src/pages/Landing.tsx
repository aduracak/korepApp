import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, LogIn, UserPlus, X } from 'lucide-react';
import { LoginDialog } from '../components/auth/LoginDialog';
import { RegisterWizard } from '../components/auth/RegisterWizard';

const cards = [
  {
    title: 'Profesor',
    description: 'Pristupite vašem profesorskom panelu',
    icon: GraduationCap,
    path: '/professor',
    color: 'from-emerald-400 to-cyan-400'
  },
  {
    title: 'Učenik',
    description: 'Pristupite vašem učeničkom panelu',
    icon: Users,
    path: '/ucenik',
    color: 'from-purple-400 to-pink-400'
  },
  {
    title: 'Admin',
    description: 'Pristupite administratorskom panelu',
    icon: ShieldCheck,
    path: '/admin',
    color: 'from-orange-400 to-red-400'
  }
];

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [expandedCard, setExpandedCard] = useState<'professor' | 'student' | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [authVariant, setAuthVariant] = useState<'professor' | 'student'>('professor');
  
  const titleScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.5]);
  const titleY = useTransform(scrollYProgress, [0, 0.2], [0, -350]);
  const titleX = useTransform(scrollYProgress, [0, 0.2], [0, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);
  const headerTitleOpacity = useTransform(scrollYProgress, [0.15, 0.2], [0, 1]);

  const handleCardClick = (type: 'professor' | 'student' | 'admin') => {
    if (type === 'admin') {
      navigate('/admin');
    } else {
      setExpandedCard(type);
    }
  };

  const handleAuthAction = (type: 'professor' | 'student', action: 'login' | 'register') => {
    setAuthVariant(type);
    if (action === 'login') {
      setShowLogin(true);
    } else {
      setShowRegister(true);
    }
    setExpandedCard(null);
  };

  return (
    <div className="flex flex-col items-center relative">
      <motion.div 
        className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-lg z-50 border-b border-white/10 flex items-center justify-center"
        style={{ opacity: headerOpacity }}
      >
        <motion.div 
          className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
          style={{ opacity: headerTitleOpacity }}
        >
          KorepApp
        </motion.div>
      </motion.div>
      
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-7xl font-bold mb-8"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Dobrodošli u
          </motion.h1>
          
          <motion.div
            className="text-8xl font-extrabold mb-8 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{
              scale: titleScale,
              y: titleY,
              x: titleX,
              position: 'relative',
              zIndex: 60
            }}
          >
            KorepApp
          </motion.div>

          <motion.p 
            className="text-2xl text-gray-300 mb-12"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Započnite svoju avanturu učenja i sticanja novih znanja
          </motion.p>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <button
              onClick={() => {
                document.getElementById('cards')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-white px-12 py-4 rounded-full text-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105"
            >
              Započni
            </button>
          </motion.div>
        </motion.div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          id="cards"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full"
        >
          {/* Professor Card */}
          <motion.div
            className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-white/10 cursor-pointer relative overflow-hidden"
            whileHover={{ scale: expandedCard ? 1 : 1.05 }}
            whileTap={{ scale: expandedCard ? 1 : 0.95 }}
            animate={{
              height: expandedCard === 'professor' ? 350 : 'auto'
            }}
            onClick={() => handleCardClick('professor')}
          >
            <motion.div
              animate={{
                y: expandedCard === 'professor' ? -20 : 0,
                scale: expandedCard === 'professor' ? 0.9 : 1
              }}
            >
              <div className="inline-block p-4 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Profesor</h2>
              <p className="text-gray-400">Pristupite vašem profesorskom panelu</p>
            </motion.div>

            {expandedCard === 'professor' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="absolute inset-x-0 bottom-0 p-6 space-y-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAuthAction('professor', 'login');
                  }}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Prijava</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAuthAction('professor', 'register');
                  }}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white/5 rounded-lg text-white font-medium hover:bg-white/10 transition-all"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Registracija</span>
                </motion.button>
              </motion.div>
            )}

            {expandedCard === 'professor' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedCard(null);
                }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>

          {/* Student Card */}
          <motion.div
            className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-white/10 cursor-pointer relative overflow-hidden"
            whileHover={{ scale: expandedCard ? 1 : 1.05 }}
            whileTap={{ scale: expandedCard ? 1 : 0.95 }}
            animate={{
              height: expandedCard === 'student' ? 350 : 'auto'
            }}
            onClick={() => handleCardClick('student')}
          >
            <motion.div
              animate={{
                y: expandedCard === 'student' ? -20 : 0,
                scale: expandedCard === 'student' ? 0.9 : 1
              }}
            >
              <div className="inline-block p-4 rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Učenik</h2>
              <p className="text-gray-400">Pristupite vašem učeničkom panelu</p>
            </motion.div>

            {expandedCard === 'student' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="absolute inset-x-0 bottom-0 p-6 space-y-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAuthAction('student', 'login');
                  }}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg text-white font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Prijava</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAuthAction('student', 'register');
                  }}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white/5 rounded-lg text-white font-medium hover:bg-white/10 transition-all"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Registracija</span>
                </motion.button>
              </motion.div>
            )}

            {expandedCard === 'student' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedCard(null);
                }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>

          {/* Admin Card */}
          <motion.div
            className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-white/10 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick('admin')}
          >
            <div className="inline-block p-4 rounded-lg bg-gradient-to-r from-orange-400 to-red-400 mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Admin</h2>
            <p className="text-gray-400">Pristupite administratorskom panelu</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Auth Dialogs */}
      <LoginDialog
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        variant={authVariant}
      />
      <RegisterWizard
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        variant={authVariant}
      />
    </div>
  );
}; 