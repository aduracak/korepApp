import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Calendar, BookOpen, Plus, School } from 'lucide-react';

export const Tutoring: React.FC = () => {
  const cards = [
    {
      title: 'Aktivne Korepeticije',
      description: 'Pregledajte trenutne korepeticije',
      icon: Users,
      color: 'from-emerald-400 to-cyan-400',
      count: '12'
    },
    {
      title: 'Zakazani Termini',
      description: 'Upravljajte rasporedom',
      icon: Calendar,
      color: 'from-purple-400 to-pink-400',
      count: '5'
    },
    {
      title: 'Materijali',
      description: 'Materijali za učenje',
      icon: BookOpen,
      color: 'from-orange-400 to-red-400',
      count: '24'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Korepeticija</h1>
            <p className="text-gray-400">Upravljajte svojim korepeticijama</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white font-medium flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Korepeticija</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => (
          <motion.div
            key={card.title}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative group cursor-pointer"
          >
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${card.color} rounded-lg opacity-20 blur group-hover:opacity-30 transition-opacity`}></div>
            
            <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-lg shadow-xl border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 bg-gradient-to-r ${card.color} rounded-lg`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                    <p className="text-sm text-gray-400">{card.description}</p>
                  </div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  {card.count}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Nedavne Aktivnosti</h2>
          <button className="text-sm text-gray-400 hover:text-white transition-colors">
            Prikaži sve
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Placeholder za aktivnosti */}
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white">Nova korepeticija zakazana</p>
                <p className="text-sm text-gray-400">Matematika - Osnove algebre</p>
              </div>
            </div>
            <span className="text-sm text-gray-400">Prije 2 sata</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white">Novi materijal dodan</p>
                <p className="text-sm text-gray-400">Fizika - Kinematika</p>
              </div>
            </div>
            <span className="text-sm text-gray-400">Prije 5 sati</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 