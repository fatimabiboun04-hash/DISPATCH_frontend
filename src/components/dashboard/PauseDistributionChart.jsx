import { useSelector } from 'react-redux'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Coffee } from 'lucide-react'
import { selectPauseDistribution } from '../../features/dashboard/dashboardSelectors'
import { Card, Skeleton } from '../ui'

const TYPE_COLORS = {
  break: '#f59e0b',
  lunch: '#10b981',
  medical: '#ef4444',
  technical: '#6172f3',
  training: '#8b5cf6',
  other: '#94a3b8',
}
const TYPE_LABELS = {
  break: 'Pause',
  lunch: 'Déjeuner',
  medical: 'Médicale',
  technical: 'Technique',
  training: 'Formation',
  other: 'Autre',
}

const PauseDistributionChart = () => {
  const dist = useSelector(selectPauseDistribution)
  const loading = useSelector((s) => s.dashboard.statsLoading)

  const data = Object.entries(dist).map(([k, v]) => ({
    name: TYPE_LABELS[k] || k,
    value: v,
    color: TYPE_COLORS[k] || '#94a3b8',
  }))

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <Card.Title>Pauses</Card.Title>
          <Coffee className="h-4 w-4 text-amber-400" />
        </div>
      </Card.Header>
      {loading ? (
        <Skeleton.Block className="h-48 w-full rounded-xl" />
      ) : total === 0 ? (
        <div className="flex h-48 items-center justify-center text-xs text-slate-400">
          Aucune pause cette semaine
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

export default PauseDistributionChart
