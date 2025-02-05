import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Diary: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Dnevnik | Korepetitor App</title>
        <meta name="description" content="Vodite evidenciju o napretku vaših učenika i pratite njihov razvoj" />
      </Helmet>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
        role="main"
        aria-labelledby="diary-title"
      >
        <div className="flex items-center space-x-4">
          <BookOpen className="w-8 h-8 text-emerald-400" aria-hidden="true" />
          <h1 id="diary-title" className="text-3xl font-bold text-white">Dnevnik</h1>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <p className="text-gray-400">Vodite evidenciju o napretku vaših učenika. Unosite bilješke sa časova, ocjenjujte rad učenika i pratite njihov razvoj. Ovdje možete pregledati historiju održanih časova i planirati buduće lekcije.</p>
        </div>
      </motion.main>
    </>
  );
};

export default Diary; 