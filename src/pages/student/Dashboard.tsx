import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, GraduationCap, Settings, Clock, Star } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const cards = [
    {
      title: 'Časovi',
      description: 'Pregledajte zakazane časove',
      icon: Calendar,
      href: '/student/lessons',
      color: 'from-emerald-400 to-cyan-400'
    },
    {
      title: 'Profesori',
      description: 'Pronađite profesore',
      icon: GraduationCap,
      href: '/student/professors',
      color: 'from-purple-400 to-pink-400'
    },
    {
      title: 'Predmeti',
      description: 'Pregledajte svoje predmete',
      icon: BookOpen,
      href: '/student/subjects',
      color: 'from-orange-400 to-red-400'
    },
    {
      title: 'Historija',
      description: 'Pregledajte historiju časova',
      icon: Clock,
      href: '/student/history',
      color: 'from-blue-400 to-indigo-400'
    },
    {
      title: 'Ocjene',
      description: 'Pregledajte svoje ocjene',
      icon: Star,
      href: '/student/grades',
      color: 'from-yellow-400 to-orange-400'
    },
    {
      title: 'Podešavanja',
      description: 'Uredite svoj profil',
      icon: Settings,
      href: '/student/settings',
      color: 'from-pink-400 to-rose-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Učenički Panel</h1>
          <p className="text-gray-400">Dobrodošli nazad</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => (
          <motion.a
            key={card.title}
            href={card.href}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative group"
          >
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${card.color} rounded-lg opacity-20 blur group-hover:opacity-30 transition-opacity`}></div>
            
            <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-xl border border-white/10 p-6 space-y-4">
              <div className={`p-3 bg-gradient-to-r ${card.color} rounded-lg w-fit`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className="text-gray-400">{card.description}</p>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}; 