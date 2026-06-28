import { useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addWeeks, startOfISOWeek, endOfISOWeek,
  format, getISOWeek, getISOWeekYear, subWeeks as sub,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { setHistoryWeekInfo } from '../features/planning/planningSlice'
import { fetchPlanningHistoryThunk } from '../features/planning/planningThunks'

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
      isToday:   false,
      isWeekend: i >= 5,
    }
  })

export const usePlanningHistory = (weekDate, setWeekDate) => {
  const dispatch = useDispatch()

  const weekStart = useMemo(() => startOfISOWeek(weekDate), [weekDate])
  const days      = useMemo(() => buildDays(weekStart), [weekStart])
  const weekNum   = useMemo(() => getISOWeek(weekDate), [weekDate])
  const year      = useMemo(() => getISOWeekYear(weekDate), [weekDate])

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
    const prev = sub(weekDate, 1)
    setWeekDate(prev)
    fetchHistoryWeek(prev)
  }, [weekDate, setWeekDate, fetchHistoryWeek])

  const goToNextWeek = useCallback(() => {
    const now  = new Date()
    const next = addWeeks(weekDate, 1)
    if (getISOWeek(next) >= getISOWeek(now) &&
        getISOWeekYear(next) >= getISOWeekYear(now)) return
    setWeekDate(next)
    fetchHistoryWeek(next)
  }, [weekDate, setWeekDate, fetchHistoryWeek])

  const weekLabel = useMemo(() =>
    `Semaine ${weekNum} · ${format(weekStart, 'd MMM', { locale: fr })} – ${format(endOfISOWeek(weekDate), 'd MMM yyyy', { locale: fr })}`,
    [weekNum, weekStart, weekDate]
  )

  const isCurrentWeek = useMemo(() =>
    getISOWeek(weekDate)     === getISOWeek(new Date()) &&
    getISOWeekYear(weekDate) === getISOWeekYear(new Date()),
    [weekDate]
  )

  const canGoForward = useMemo(() =>
    getISOWeek(weekDate)      < getISOWeek(new Date()) ||
    getISOWeekYear(weekDate)  < getISOWeekYear(new Date()),
    [weekDate]
  )

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
