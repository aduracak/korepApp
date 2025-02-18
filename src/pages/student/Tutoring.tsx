import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { School, Calendar, BookOpen, Plus, Clock, GraduationCap } from 'lucide-react';
import { ActiveTutoring } from '../../components/tutoring/ActiveTutoring';
import { TestRecommendations } from '../../components/tutoring/TestRecommendations';
import { ScheduleTutoringDialog } from '../../components/tutoring/ScheduleTutoringDialog';

export const Tutoring: React.FC = () => {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const cards = [
    {
      title: 'Aktivne Korepeticije',
      description: 'Vaše trenutne korepeticije',
      icon: School,
      color: 'from-emerald-400 to-cyan-400',
      count: '3'
    },
    {
      title: 'Sljedeći Čas',
      description: 'Za 2 dana - Matematika',
      icon: Clock,
      color: 'from-purple-400 to-pink-400',
      time: '14:30'
    },
    {
      title: 'Materijali',
      description: 'Dostupni materijali',
      icon: BookOpen,
      color: 'from-orange-400 to-red-400',
      count: '8'
    }
  ];

  const professors = [
    {
      name: 'Prof. Amila Hodžić',
      subject: 'Matematika',
      rating: '4.9',
      availability: 'Dostupan/na',
      color: 'from-emerald-400 to-cyan-400'
    },
    {
      name: 'Prof. Emir Kovačević',
      subject: 'Fizika',
      rating: '4.8',
      availability: 'Zauzet/a do 15:00',
      color: 'from-purple-400 to-pink-400'
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
          onClick={() => setIsScheduleDialogOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white font-medium flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Zakaži Korepeticiju</span>
        </motion.button>
      </div>

      {/* Active Tutoring Sessions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Aktivne Korepeticije
        </h2>
        <ActiveTutoring />
      </div>

      {/* Test Recommendations */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Nadolazeći Testovi
        </h2>
        <TestRecommendations />
      </div>

      {/* Schedule Dialog */}
      <ScheduleTutoringDialog
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
      />

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
                  {card.count || card.time}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Professors Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Dostupni Profesori</h2>
          <button className="text-sm text-gray-400 hover:text-white transition-colors">
            Prikaži sve
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {professors.map(professor => (
            <motion.div
              key={professor.name}
              whileHover={{ scale: 1.01 }}
              className="relative group"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${professor.color} rounded-lg opacity-20 blur group-hover:opacity-30 transition-opacity`}></div>
              
              <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-lg border border-white/10 p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{professor.name}</h3>
                    <p className="text-sm text-gray-400">{professor.subject}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-400 text-sm">★ {professor.rating}</span>
                      <span className="mx-2 text-gray-600">•</span>
                      <span className="text-sm text-emerald-400">{professor.availability}</span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm transition-colors"
                  >
                    Kontaktiraj
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Schedule Preview */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Raspored Korepeticija</h2>
          <button className="text-sm text-gray-400 hover:text-white transition-colors">
            Kompletan raspored
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white">Matematika - Priprema za test</p>
                <p className="text-sm text-gray-400">Prof. Amila Hodžić</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white">Srijeda, 15:00</p>
              <p className="text-sm text-gray-400">45 minuta</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white">Fizika - Mehanika</p>
                <p className="text-sm text-gray-400">Prof. Emir Kovačević</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white">Petak, 16:30</p>
              <p className="text-sm text-gray-400">60 minuta</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 