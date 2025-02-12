import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const Diary: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-4">
        <BookOpen className="w-8 h-8 text-emerald-400" />
        <h1 className="text-3xl font-bold text-white">Dnevnik</h1>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <p className="text-gray-400">Vodite evidenciju o napretku vaših učenika. Unosite bilješke sa časova, ocjenjujte rad učenika i pratite njihov razvoj. Ovdje možete pregledati historiju održanih časova i planirati buduće lekcije.</p>
      </div>
    </motion.div>
  );
};

export default Diary; 