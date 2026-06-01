import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'

/**
 * LoadingScreen — branded splash shown on initial app boot.
 * Auto-hides after `duration` ms.
 */
const LoadingScreen = ({ duration = 1800, onComplete }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onComplete, 400) // wait for fade-out
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onComplete])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center
                     justify-center bg-slate-950"
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-96 w-96
                            -translate-x-1/2 -translate-y-1/2 rounded-full
                            bg-brand-500/10 blur-3xl" />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
            className="relative z-10 mb-6 flex flex-col items-center gap-4"
          >
            <div className="flex h-16 w-16 items-center justify-center
                            rounded-2xl bg-brand-500 shadow-glow">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Dispatch <span className="text-brand-400">Live</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Workforce Management Platform
              </p>
            </div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="relative z-10 h-0.5 w-48 overflow-hidden
                       rounded-full bg-slate-800"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: duration / 1000 - 0.2, ease: 'easeInOut' }}
              className="h-full w-full rounded-full bg-brand-500"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingScreen