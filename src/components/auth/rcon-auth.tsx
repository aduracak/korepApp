import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Key, ArrowLeft, Loader2 } from 'lucide-react'
import { rconAuth } from '@/lib/rcon-auth'
import { toast } from 'sonner'

const backgroundVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  exit: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
}

const inputVariants = {
  focus: { scale: 1.02 },
  blur: { scale: 1 }
}

export function RconAuth() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const MAX_ATTEMPTS = 3

  useEffect(() => {
    // Provjeri da li je već autoriziran
    if (rconAuth.isAuthorized()) {
      handleSuccessfulAuth()
    }
  }, [])

  const handleSuccessfulAuth = () => {
    setIsExiting(true)
    // Sačekaj da se završi animacija prije navigacije
    setTimeout(() => {
      navigate('/admin')
    }, 200)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    const response = await rconAuth.authorize(code)
    setIsLoading(false)

    if (response.success) {
      toast.success(response.message)
      handleSuccessfulAuth()
    } else {
      setAttempts(prev => prev + 1)
      if (attempts + 1 >= MAX_ATTEMPTS) {
        toast.error('Previše neuspješnih pokušaja')
        setIsExiting(true)
        setTimeout(() => navigate('/'), 2000)
      } else {
        toast.error(`${response.message} (Preostalo pokušaja: ${MAX_ATTEMPTS - (attempts + 1)})`)
      }
      setCode('')
    }
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4"
      variants={backgroundVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate={isExiting ? "exit" : "animate"}
        exit="exit"
        className="w-full max-w-md"
      >
        <div className="relative">
          {/* Blur effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl opacity-20 blur"></div>
          
          <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10">
            <div className="p-8">
              <div className="flex items-center mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsExiting(true)
                    setTimeout(() => navigate('/'), 200)
                  }}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </motion.button>
                
                <div className="flex-1 text-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.2 }}
                    className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-xl mb-4 border border-white/5"
                  >
                    <Shield className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-white"
                  >
                    RCON Autorizacija
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-400 mt-2"
                  >
                    Unesite RCON kod za pristup admin panelu
                  </motion.p>
                </div>

                <div className="w-9" /> {/* Spacer za centriranje */}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <motion.input
                    type="password"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    variants={inputVariants}
                    whileFocus="focus"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 text-white placeholder-gray-500 transition-all duration-200"
                    placeholder="Unesite RCON kod"
                    required
                    disabled={isLoading || isExiting}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || isExiting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="relative w-full px-4 py-3 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 overflow-hidden group"
                >
                  <span className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
                    Autorizacija
                  </span>
                  
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 