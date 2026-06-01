import { Sun, Moon, Monitor } from 'lucide-react'
import { motion } from 'framer-motion'
import { useDarkMode } from '../../hooks/useDarkMode'
import { cn } from '../../utils/cn'

const OPTIONS = [
  { value: 'light', icon: Sun,     label: 'Light' },
  { value: 'dark',  icon: Moon,    label: 'Dark'  },
  { value: 'auto',  icon: Monitor, label: 'Auto'  },
]

/**
 * ThemeToggle — 3-way light / dark / auto switcher.
 * Renders as a compact pill with animated active indicator.
 */
const ThemeToggle = () => {
  const { theme, setTheme } = useDarkMode()

  return (
    <div className="flex items-center gap-0.5 rounded-lg
                    bg-surface-100 p-0.5
                    dark:bg-dark-600">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={cn(
            'relative flex h-7 w-7 items-center justify-center rounded-md',
            'transition-all duration-200',
            theme === value
              ? 'text-slate-700 dark:text-slate-200'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          )}
        >
          {theme === value && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 rounded-md bg-white shadow-soft
                         dark:bg-dark-400"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Icon className="relative z-10 h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  )
}

export default ThemeToggle