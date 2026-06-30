import { useSelector } from 'react-redux'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Star } from 'lucide-react'
import { selectRatingsEvolution } from '../../features/dashboard/dashboardSelectors'
import { Card, Skeleton } from '../ui'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-surface-200 bg-white px-3 py-2 shadow-strong dark:border-dark-500 dark:bg-dark-700">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">S{label}</p>
      {payload.map((e) => (
        <p key={e.name} className="text-xs text-slate-500">
          {e.name}: <span className="font-medium">{e.value}</span>
        </p>
      ))}
    </div>
  )
}

const RatingsEvolutionChart = () => {
  const data = useSelector(selectRatingsEvolution)
  const loading = useSelector((s) => s.dashboard.statsLoading)

  const chartData = data.map((d) => ({
    week: `${d.week_number}`,
    'Note moyenne': d.average_score,
    '5 étoiles': d.five_star_count,
  })).reverse()

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <Card.Title>Notes</Card.Title>
          <Star className="h-4 w-4 text-amber-400" />
        </div>
      </Card.Header>
      {loading ? (
        <Skeleton.Block className="h-48 w-full rounded-xl" />
      ) : chartData.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-xs text-slate-400">
          Aucune note cette semaine
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 5]} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="Note moyenne"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

export default RatingsEvolutionChart
