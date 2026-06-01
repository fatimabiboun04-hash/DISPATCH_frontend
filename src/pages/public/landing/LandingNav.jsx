import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap } from 'lucide-react'
import { cn } from '../../../utils/cn'

const NAV_LINKS = [
  { label: 'Accueil',   href: '#hero' },
  { label: 'About',     href: '#about' },
  { label: 'Contact',   href: '#contact' },
  { label: 'Connexion', href: '#login' },
]

/**
 * LandingNav — sticky transparent navbar with scroll-aware background.
 */
const LandingNav = () => {
  const [scrolled,     setScrolled]     = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  // Detect scroll for background blur
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight active nav link based on scroll position
  useEffect(() => {
    const sections = ['hero', 'about', 'contact', 'login']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -40% 0px' }
    )
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (href) => {
    const id = href.replace('#', '')
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled
            ? 'border-b border-white/5 bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-black/10'
            : 'bg-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          {/* Logo */}
          <button
            onClick={() => scrollTo('#hero')}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg
                            bg-brand-500 shadow-glow-sm">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              Dispatch <span className="text-brand-400">Live</span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150',
                  activeSection === link.href.replace('#', '')
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {link.label}
                {activeSection === link.href.replace('#', '') && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="mt-0.5 h-0.5 w-full rounded-full bg-brand-400"
                  />
                )}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => scrollTo('#login')}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold
                         text-white shadow-glow-sm transition-all duration-200
                         hover:bg-brand-400 hover:shadow-glow active:scale-95"
            >
              Commencer
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg
                       text-slate-400 hover:bg-white/5 hover:text-white md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 border-b border-white/5
                       bg-slate-950/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="rounded-lg px-4 py-3 text-left text-sm font-medium
                             text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => scrollTo('#login')}
                className="mt-2 rounded-lg bg-brand-500 py-3 text-sm font-semibold
                           text-white hover:bg-brand-400"
              >
                Commencer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default LandingNav