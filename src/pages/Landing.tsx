import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, School, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AuthPopover } from '../components/shared/AuthPopover';
import { useAuth } from '../contexts/AuthContext';

interface PopoverState {
  isOpen: boolean;
  position: { x: number; y: number };
  role: 'professor' | 'student' | null;
}

const cards = [
  {
    title: 'Učenik',
    description: 'Pristupite vašem učeničkom panelu',
    icon: GraduationCap,
    path: '/ucenik',
    role: 'student',
    color: 'from-blue-400 to-indigo-400'
  },
  {
    title: 'Profesor',
    description: 'Pristupite vašem profesorskom panelu',
    icon: School,
    path: '/professor',
    role: 'professor',
    color: 'from-emerald-400 to-cyan-400'
  },
  {
    title: 'Admin',
    description: 'Pristupite administratorskom panelu',
    icon: ShieldCheck,
    path: '/admin',
    role: 'admin',
    color: 'from-orange-400 to-red-400'
  }
] as const;

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { scrollYProgress } = useScroll();
  const [popover, setPopover] = useState<PopoverState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    role: null
  });
  
  const titleScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.5]);
  const titleY = useTransform(scrollYProgress, [0, 0.2], [0, -350]);
  const titleX = useTransform(scrollYProgress, [0, 0.2], [0, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1]);
  const headerTitleOpacity = useTransform(scrollYProgress, [0.15, 0.2], [0, 1]);

  const handleCardClick = (card: typeof cards[number]) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === card.role || card.role === undefined) {
      navigate(card.path);
    } else {
      console.log('Nemate pristup ovom dijelu aplikacije');
    }
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
          {cards.map((card) => (
            <motion.div
              key={card.path}
              className="relative group cursor-pointer"
            >
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${card.color} rounded-2xl opacity-75 blur group-hover:opacity-100 transition duration-200`}
              ></div>
              <div
                className="relative bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10"
                onClick={() => handleCardClick(card)}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} p-2.5 mb-4`}>
                  <card.icon className="w-full h-full text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{card.title}</h2>
                <p className="text-gray-400">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {popover.isOpen && popover.role && (
        <AuthPopover
          isOpen={popover.isOpen}
          onClose={() => setPopover(prev => ({ ...prev, isOpen: false }))}
          position={popover.position}
          role={popover.role}
        />
      )}
    </div>
  );
};

export default Landing; 