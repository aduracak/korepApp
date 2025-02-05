import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Tutoring: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Korepeticija | KorepApp</title>
        <meta name="description" content="Pristupite svojim korepeticijama, pregledajte materijale i pratite svoj napredak" />
      </Helmet>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
        role="main"
        aria-labelledby="tutoring-title"
      >
        <div className="flex items-center space-x-4">
          <GraduationCap className="w-8 h-8 text-emerald-400" aria-hidden="true" />
          <h1 id="tutoring-title" className="text-3xl font-bold text-white">Korepeticija</h1>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <p className="text-gray-400">Pristupite svojim korepeticijama, pregledajte materijale za učenje, pratite svoj napredak i komunicirajte sa profesorima. Ovdje možete vidjeti sve informacije vezane za vaše časove.</p>
        </div>
      </motion.main>
    </>
  );
};

export default Tutoring; 