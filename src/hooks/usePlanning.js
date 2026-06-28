import { useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addWeeks, subWeeks, startOfISOWeek, endOfISOWeek, format, getISOWeek, getISOWeekYear } from 'date-fns'
import { fr } from 'date-fns/locale'
import { setWeekInfo } from '../features/planning/planningSlice'
import { selectWeekInfo, selectPlanningFilters } from '../features/planning/planningSelectors'
import { fetchPlanningThunk } from '../features/planning/planningThunks'

const DAY_LABELS_SHORT = {
  'Mon': 'Lun', 'Tue': 'Mar', 'Wed': 'Mer',
  'Thu': 'Jeu', 'Fri': 'Ven', 'Sat': 'Sam', 'Sun': 'Dim',
}

const buildDays = (weekStart) => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const iso  = format(date, 'yyyy-MM-dd')
    const eng  = format(date, 'EEE')
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
  const filters   = useSelector(selectPlanningFilters)

  const weekStart = useMemo(() => startOfISOWeek(weekDate), [weekDate])
  const days      = useMemo(() => buildDays(weekStart), [weekStart])
  const weekNum   = useMemo(() => getISOWeek(weekDate), [weekDate])
  const year      = useMemo(() => getISOWeekYear(weekDate), [weekDate])

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
    fetchWeek(next, {
      team_id:  filters.team_id  || undefined,
      shift_id: filters.shift_id || undefined,
      user_id:  filters.user_id  || undefined,
    })
  }, [weekDate, setWeekDate, fetchWeek, filters])

  const goToPrevWeek = useCallback(() => {
    const prev = subWeeks(weekDate, 1)
    setWeekDate(prev)
    fetchWeek(prev, {
      team_id:  filters.team_id  || undefined,
      shift_id: filters.shift_id || undefined,
      user_id:  filters.user_id  || undefined,
    })
  }, [weekDate, setWeekDate, fetchWeek, filters])

  const goToCurrentWeek = useCallback(() => {
    const today = new Date()
    setWeekDate(today)
    fetchWeek(today, {
      team_id:  filters.team_id  || undefined,
      shift_id: filters.shift_id || undefined,
      user_id:  filters.user_id  || undefined,
    })
  }, [setWeekDate, fetchWeek, filters])

  const weekLabel = useMemo(() =>
    `Semaine ${weekNum} · ${format(weekStart, 'd MMM', { locale: fr })} – ${format(endOfISOWeek(weekDate), 'd MMM yyyy', { locale: fr })}`,
    [weekNum, weekStart, weekDate]
  )

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
