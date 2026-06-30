import { useSelector } from 'react-redux'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Clock } from 'lucide-react'
import {
  selectWeeklyWorkedHours,
  selectWeeklyPlannedHours,
  selectWeeklyComparison,
} from '../../features/dashboard/dashboardSelectors'
import { Card, Skeleton } from '../ui'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-surface-200 bg-white px-3 py-2 shadow-strong dark:border-dark-500 dark:bg-dark-700">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((e) => (
        <p key={e.name} className="text-xs text-slate-500">
          <span className="font-medium" style={{ color: e.color }}>{e.value}h</span>
          {' '}{e.name}
        </p>
      ))}
    </div>
  )
}

const HoursChart = () => {
  const worked     = useSelector(selectWeeklyWorkedHours)
  const planned    = useSelector(selectWeeklyPlannedHours)
  const comparison = useSelector(selectWeeklyComparison)
  const loading    = useSelector((s) => s.dashboard.statsLoading)

  const chartData = [
    { name: 'Cette semaine', 'Planifiées': planned, 'Travaillées': worked },
  ]

  if (comparison.previous_week) {
    chartData.unshift({
      name: `S${comparison.previous_week}`,
      'Planifiées': comparison.previous_hours,
      'Travaillées': comparison.previous_hours,
    })
  }

  const change = comparison.hours_change
  const changeColor = change > 0 ? 'text-emerald-500' : change < 0 ? 'text-red-500' : 'text-slate-400'

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <Card.Title>Heures</Card.Title>
          <Clock className="h-4 w-4 text-brand-400" />
        </div>
      </Card.Header>
      {loading ? (
        <Skeleton.Block className="h-48 w-full rounded-xl" />
      ) : (
        <>
          <div className="flex items-center gap-4 px-1 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Travaillées:</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{worked}h</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Planifiées:</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{planned}h</span>
            </div>
            {comparison.hours_change !== 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">vs S{comparison.previous_week}:</span>
                <span className={`text-sm font-bold ${changeColor}`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="Planifiées" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="Travaillées" fill="#6172f3" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </Card>
  )
}

export default HoursChart
