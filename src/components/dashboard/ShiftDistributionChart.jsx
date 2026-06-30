import { useSelector } from 'react-redux'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { LayoutGrid } from 'lucide-react'
import {
  selectShiftDistribution,
  selectCharts,
} from '../../features/dashboard/dashboardSelectors'
import { Card, Skeleton } from '../ui'

const COLORS = ['#6172f3', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-surface-200 bg-white px-3 py-2 shadow-strong dark:border-dark-500 dark:bg-dark-700">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{d.shift_name}</p>
      <p className="text-xs text-slate-500">{d.count} affectations ({d.percentage}%)</p>
    </div>
  )
}

const ShiftDistributionChart = () => {
  const data = useSelector(selectShiftDistribution)
  const loading = useSelector((s) => s.dashboard.statsLoading)

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <Card.Title>Répartition des Shifts</Card.Title>
          <LayoutGrid className="h-4 w-4 text-brand-400" />
        </div>
      </Card.Header>
      {loading ? (
        <Skeleton.Block className="h-48 w-full rounded-xl" />
      ) : data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-xs text-slate-400">
          Aucune donnée cette semaine
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="shift_name"
              cx="50%" cy="50%"
              outerRadius={70}
              innerRadius={40}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 10 }}
              formatter={(v) => <span className="text-xs text-slate-500">{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

export default ShiftDistributionChart
