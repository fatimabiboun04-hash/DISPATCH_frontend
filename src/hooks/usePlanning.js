import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addWeeks, subWeeks, startOfISOWeek, endOfISOWeek, format, getISOWeek, getISOWeekYear } from 'date-fns'
import { fr } from 'date-fns/locale'
import { setWeekInfo } from '../features/planning/planningSlice'
import { selectWeekInfo } from '../features/planning/planningSelectors'
import { fetchPlanningThunk } from '../features/planning/planningThunks'

/**
 * usePlanning — week navigation and fetch orchestration.
 *
 * Provides:
 * - currentWeekDate: Date object of Monday of the viewed week
 * - days: array of 7 { date: 'YYYY-MM-DD', label: 'Lun', dayNum, isToday } objects
 * - goToNextWeek / goToPrevWeek / goToCurrentWeek
 * - fetchCurrentWeek(filters) — triggers API call
 */

const DAY_LABELS_SHORT = {
  'Mon': 'Lun', 'Tue': 'Mar', 'Wed': 'Mer',
  'Thu': 'Jeu', 'Fri': 'Ven', 'Sat': 'Sam', 'Sun': 'Dim',
}

const buildDays = (weekStart) => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const iso  = format(date, 'yyyy-MM-dd')
    const eng  = format(date, 'EEE')  // 'Mon', 'Tue', ...
    const today = format(new Date(), 'yyyy-MM-dd')
    return {
      date:    iso,
      label:   DAY_LABELS_SHORT[eng] || eng,
      dayNum:  format(date, 'd'),
      month:   format(date, 'MMM', { locale: fr }),
      isToday: iso === today,
      isWeekend: i >= 5,
    }
  })
}

export const usePlanning = (weekDate, setWeekDate) => {
  const dispatch  = useDispatch()
  const weekInfo  = useSelector(selectWeekInfo)

  const weekStart = startOfISOWeek(weekDate)
  const days      = buildDays(weekStart)
  const weekNum   = getISOWeek(weekDate)
  const year      = getISOWeekYear(weekDate)

  const fetchWeek = useCallback((date, extraFilters = {}) => {
    const wn = getISOWeek(date)
    const yr = getISOWeekYear(date)
    dispatch(setWeekInfo({ weekNumber: wn, year: yr }))
    dispatch(fetchPlanningThunk({
      week_number: wn,
      year:        yr,
      ...extraFilters,
    }))
  }, [dispatch])

  const goToNextWeek = useCallback(() => {
    const next = addWeeks(weekDate, 1)
    setWeekDate(next)
    fetchWeek(next)
  }, [weekDate, setWeekDate, fetchWeek])

  const goToPrevWeek = useCallback(() => {
    const prev = subWeeks(weekDate, 1)
    setWeekDate(prev)
    fetchWeek(prev)
  }, [weekDate, setWeekDate, fetchWeek])

  const goToCurrentWeek = useCallback(() => {
    const today = new Date()
    setWeekDate(today)
    fetchWeek(today)
  }, [setWeekDate, fetchWeek])

  const weekLabel = `Semaine ${weekNum} · ${format(weekStart, 'd MMM', { locale: fr })} – ${format(endOfISOWeek(weekDate), 'd MMM yyyy', { locale: fr })}`

  return {
    weekDate,
    weekStart,
    days,
    weekNum,
    year,
    weekLabel,
    fetchWeek,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
  }
}