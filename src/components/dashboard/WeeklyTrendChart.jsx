import { useSelector } from 'react-redux'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import {
  selectCoverageWeek,
  selectCoverageLoading,
} from '../../features/dashboard/dashboardSelectors'
import { Card, Skeleton } from '../ui'

/**
 * WeeklyTrendChart — area chart of coverage % per day this week.
 *
 * Data: GET /v1/dashboard/coverage (same endpoint as CoverageGauge)
 * Shape: [{ date, day_name, assigned, checked_in, coverage }]
 */

const DAY_FR = {
  Mon: 'Lun', Tue: 'Mar', Wed: 'Mer',
  Thu: 'Jeu', Fri: 'Ven', Sat: 'Sam', Sun: 'Dim',
}

// Custom recharts tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-surface-200 bg-white px-3 py-2.5
                    shadow-strong dark:border-dark-500 dark:bg-dark-700">
      <p className="mb-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium" style={{ color: entry.color }}>
            {entry.value}%
          </span>
          {' '}couverture
        </p>
      ))}
    </div>
  )
}

const WeeklyTrendChart = () => {
  const weekData = useSelector(selectCoverageWeek)
  const loading  = useSelector(selectCoverageLoading)

  const chartData = weekData.map((d) => ({
    day:      DAY_FR[d.day_name] || d.day_name,
    coverage: d.coverage,
    assigned: d.assigned,
    present:  d.checked_in,
  }))

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <Card.Title>Tendance de Couverture</Card.Title>
          <TrendingUp className="h-4 w-4 text-brand-400" />
        </div>
        <span className="text-xs text-slate-400">Semaine en cours</span>
      </Card.Header>

      {loading ? (
        <Skeleton.Block className="h-48 w-full rounded-xl" />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}
                     margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="coverageGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6172f3" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6172f3" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--bg-border)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="coverage"
              stroke="#6172f3"
              strokeWidth={2}
              fill="url(#coverageGrad)"
              dot={{ fill: '#6172f3', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

export default WeeklyTrendChart