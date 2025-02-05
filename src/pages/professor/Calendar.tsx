import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Calendar: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Kalendar | Korepetitor App</title>
        <meta name="description" content="Upravljajte svojim rasporedom korepeticija i organizujte časove efikasno" />
      </Helmet>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
        role="main"
        aria-labelledby="calendar-title"
      >
        <div className="flex items-center space-x-4">
          <CalendarIcon className="w-8 h-8 text-emerald-400" aria-hidden="true" />
          <h1 id="calendar-title" className="text-3xl font-bold text-white">Kalendar</h1>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <p className="text-gray-400">Upravljajte svojim rasporedom korepeticija. Pregledajte zakazane termine, organizujte nove časove i optimizirajte svoje vrijeme. Ovdje možete vidjeti sve svoje obaveze na jednom mjestu.</p>
        </div>
      </motion.main>
    </>
  );
};

export default Calendar; 