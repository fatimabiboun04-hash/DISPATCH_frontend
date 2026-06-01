import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addWeeks, startOfISOWeek, endOfISOWeek,
  format, getISOWeek, getISOWeekYear, subWeeks as sub,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { setHistoryWeekInfo } from '../features/planning/planningSlice'
import { fetchPlanningHistoryThunk } from '../features/planning/planningThunks'

/**
 * usePlanningHistory — week navigation for the read-only history view.
 *
 * Starts at current week - 1 (most recent past week).
 * Can only navigate into the past (no future navigation in history).
 * Builds the same `days` array structure used by the live planning grid.
 */

const DAY_LABELS_SHORT = {
  'Mon': 'Lun', 'Tue': 'Mar', 'Wed': 'Mer',
  'Thu': 'Jeu', 'Fri': 'Ven', 'Sat': 'Sam', 'Sun': 'Dim',
}

const buildDays = (weekStart) =>
  Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const iso = format(date, 'yyyy-MM-dd')
    const eng = format(date, 'EEE')
    return {
      date:      iso,
      label:     DAY_LABELS_SHORT[eng] || eng,
      dayNum:    format(date, 'd'),
      month:     format(date, 'MMM', { locale: fr }),
      isToday:   false,   // never "today" in history view
      isWeekend: i >= 5,
    }
  })

export const usePlanningHistory = (weekDate, setWeekDate) => {
  const dispatch = useDispatch()

  const weekStart = startOfISOWeek(weekDate)
  const days      = buildDays(weekStart)
  const weekNum   = getISOWeek(weekDate)
  const year      = getISOWeekYear(weekDate)

  const fetchHistoryWeek = useCallback((date, extraFilters = {}) => {
    const wn = getISOWeek(date)
    const yr = getISOWeekYear(date)
    dispatch(setHistoryWeekInfo({ weekNumber: wn, year: yr }))
    dispatch(fetchPlanningHistoryThunk({
      week_number: wn,
      year:        yr,
      ...extraFilters,
    }))
  }, [dispatch])

  const goToPrevWeek = useCallback(() => {
    const prev = subWeeks(weekDate, 1)
    setWeekDate(prev)
    fetchHistoryWeek(prev)
  }, [weekDate, setWeekDate, fetchHistoryWeek])

  const goToNextWeek = useCallback(() => {
    // Never navigate into future in history view
    const now  = new Date()
    const next = addWeeks(weekDate, 1)
    if (getISOWeek(next) >= getISOWeek(now) &&
        getISOWeekYear(next) >= getISOWeekYear(now)) return
    setWeekDate(next)
    fetchHistoryWeek(next)
  }, [weekDate, setWeekDate, fetchHistoryWeek])

  const weekLabel = `Semaine ${weekNum} · ${format(weekStart, 'd MMM', { locale: fr })} – ${format(endOfISOWeek(weekDate), 'd MMM yyyy', { locale: fr })}`

  const isCurrentWeek =
    getISOWeek(weekDate)     === getISOWeek(new Date()) &&
    getISOWeekYear(weekDate) === getISOWeekYear(new Date())

  // Check if we can go forward (must be before current week)
  const canGoForward =
    getISOWeek(weekDate)      < getISOWeek(new Date()) ||
    getISOWeekYear(weekDate)  < getISOWeekYear(new Date())

  return {
    weekDate,
    weekStart,
    days,
    weekNum,
    year,
    weekLabel,
    fetchHistoryWeek,
    goToPrevWeek,
    goToNextWeek,
    canGoForward,
    isCurrentWeek,
  }
}