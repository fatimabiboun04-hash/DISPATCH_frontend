import { useSelector } from 'react-redux'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { CheckSquare } from 'lucide-react'
import {
  selectTaskByStatus,
} from '../../features/dashboard/dashboardSelectors'
import { Card, Skeleton } from '../ui'

const STATUS_COLORS = {
  completed: '#10b981',
  in_progress: '#6172f3',
  pending: '#f59e0b',
  cancelled: '#ef4444',
}
const STATUS_LABELS = {
  completed: 'Terminées',
  in_progress: 'En cours',
  pending: 'En attente',
  cancelled: 'Annulées',
}

const TaskDistributionChart = () => {
  const byStatus = useSelector(selectTaskByStatus)
  const loading = useSelector((s) => s.dashboard.statsLoading)

  const data = Object.entries(byStatus).map(([k, v]) => ({
    name: STATUS_LABELS[k] || k,
    value: v,
    color: STATUS_COLORS[k] || '#94a3b8',
  }))

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <Card.Title>Tâches</Card.Title>
          <CheckSquare className="h-4 w-4 text-brand-400" />
        </div>
      </Card.Header>
      {loading ? (
        <Skeleton.Block className="h-48 w-full rounded-xl" />
      ) : total === 0 ? (
        <div className="flex h-48 items-center justify-center text-xs text-slate-400">
          Aucune tâche cette semaine
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="50%"
                outerRadius={55}
                innerRadius={30}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-1">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                <span className="text-2xs text-slate-500">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export default TaskDistributionChart
