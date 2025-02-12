import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Database, History, Settings, GraduationCap, BookOpen } from 'lucide-react';

export const Dashboard = () => {
  const cards = [
    {
      name: 'Korisnici',
      description: 'Upravljajte korisnicima sistema',
      href: '/admin/users',
      icon: Users,
      gradient: 'from-blue-500 to-indigo-500',
      iconBg: 'rgb(99 102 241)'
    },
    {
      name: 'Zbornica',
      description: 'Pregledajte podatke zbornice',
      href: '/admin/staffroom',
      icon: Database,
      gradient: 'from-violet-500 to-purple-500',
      iconBg: 'rgb(139 92 246)'
    },
    {
      name: 'Razredi',
      description: 'Upravljajte razredima',
      href: '/admin/classes',
      icon: GraduationCap,
      gradient: 'from-indigo-500 to-blue-500',
      iconBg: 'rgb(59 130 246)'
    },
    {
      name: 'Historija',
      description: 'Pregledajte historiju aktivnosti',
      href: '/admin/history',
      icon: History,
      gradient: 'from-purple-500 to-violet-500',
      iconBg: 'rgb(124 58 237)'
    },
    {
      name: 'Podešavanja',
      description: 'Upravljajte podešavanjima sistema',
      href: '/admin/settings',
      icon: Settings,
      gradient: 'from-blue-600 to-indigo-600',
      iconBg: 'rgb(79 70 229)'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Admin Panel</h1>
          <p className="text-gray-400">Dobrodošli u administratorski panel</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${card.gradient} opacity-20 blur transition duration-300 group-hover:opacity-30`} />
            
            <Link
              to={card.href}
              className="relative flex flex-col h-full min-h-[200px] p-6 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 transition-all duration-300 hover:border-white/20 hover:bg-slate-800/70"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: card.iconBg }}
                >
                  <card.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {card.name}
                </h2>
              </div>
              <p className="text-gray-400 text-base">
                {card.description}
              </p>
              <div className="mt-auto pt-6">
                <div className="flex items-center text-sm text-gray-400 group-hover:text-white/90 transition-colors">
                  <span>Otvori {card.name.toLowerCase()}</span>
                  <svg
                    className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}; 