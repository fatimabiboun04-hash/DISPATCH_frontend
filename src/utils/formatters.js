import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Format a date string or Date object.
 * @param {string|Date} date
 * @param {string} pattern  — date-fns pattern, default: 'dd MMM yyyy'
 */
export const formatDate = (date, pattern = 'dd MMM yyyy') => {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return format(d, pattern, { locale: fr })
}

/**
 * Format a datetime to time only: '14:30'
 */
export const formatTime = (date) => {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return format(d, 'HH:mm')
}

/**
 * Format a datetime to full readable: 'lundi 20 mai 2025, 14:30'
 */
export const formatDateTime = (date) => {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return format(d, "EEEE d MMMM yyyy, HH:mm", { locale: fr })
}

/**
 * Format relative time: '3 minutes ago' → 'il y a 3 minutes'
 */
export const formatRelative = (date) => {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return formatDistanceToNow(d, { addSuffix: true, locale: fr })
}

/**
 * Format minutes as hours string: 480 → '8h 00min' / '8.0h'
 */
export const formatMinutesToHours = (minutes, short = false) => {
  if (!minutes && minutes !== 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (short) return `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}`
  return `${h}h ${m.toString().padStart(2, '0')}min`
}

/**
 * Format decimal hours: 8.5 → '8h 30min'
 */
export const formatHours = (hours, short = false) => {
  if (hours === null || hours === undefined) return '—'
  return formatMinutesToHours(Math.round(hours * 60), short)
}

/**
 * Get ISO week number for a date
 */
export const getWeekNumber = (date = new Date()) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

/**
 * Get the Monday of a given ISO week
 */
export const getWeekStart = (weekNumber, year) => {
  const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7)
  const dow = simple.getDay()
  const ISOweekStart = simple
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
  }
  return ISOweekStart
}

/**
 * Format a name for display: truncate if too long
 */
export const formatName = (name, maxLength = 20) => {
  if (!name) return '—'
  if (name.length <= maxLength) return name
  return name.slice(0, maxLength).trim() + '…'
}

/**
 * Format short name (first + last initial): 'Fatima A.'
 */
export const formatShortName = (name) => {
  if (!name) return '—'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}