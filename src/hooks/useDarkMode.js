import { useEffect, useState, useCallback } from 'react'

/**
 * useDarkMode
 *
 * Manages theme: 'light' | 'dark' | 'auto'
 * - 'auto'  → follows system preference (prefers-color-scheme)
 * - 'light' → forces light
 * - 'dark'  → forces dark
 *
 * Persists choice in localStorage under key 'dispatch_theme'
 * Applies 'dark' class to <html> element for Tailwind dark mode
 */
const STORAGE_KEY = 'dispatch_theme'

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export const useDarkMode = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'auto'
  )

  // Compute the effective theme (resolves 'auto' to actual light/dark)
  const effective = theme === 'auto' ? getSystemTheme() : theme

  const applyTheme = useCallback((resolved) => {
    const root = document.documentElement
    if (resolved === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  // Apply on mount and when theme changes
  useEffect(() => {
    applyTheme(effective)
  }, [effective, applyTheme])

  // Listen to system changes when theme is 'auto'
  useEffect(() => {
    if (theme !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => applyTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, applyTheme])

  const setAndPersist = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
  }

  return {
    theme,          // 'light' | 'dark' | 'auto'  (stored preference)
    effective,      // 'light' | 'dark'            (what is actually shown)
    isDark: effective === 'dark',
    setTheme: setAndPersist,
    toggleTheme: () => {
      const next = effective === 'dark' ? 'light' : 'dark'
      setAndPersist(next)
    },
  }
}