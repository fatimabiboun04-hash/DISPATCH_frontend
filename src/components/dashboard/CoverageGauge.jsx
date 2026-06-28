import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis
} from 'recharts'
import {
  selectCoveragePct,
  selectCoverageWeek,
  selectCoverageLoading,
  selectCoverageError,
} from '../../features/dashboard/dashboardSelectors'
import { Card, Skeleton, ErrorState } from '../ui'
import { cn } from '../../utils/cn'

const DAY_LABELS = {
  Mon: 'Lun', Tue: 'Mar', Wed: 'Mer',
  Thu: 'Jeu', Fri: 'Ven', Sat: 'Sam', Sun: 'Dim',
}

const CoverageGauge = () => {
  const pct      = useSelector(selectCoveragePct)
  const weekData = useSelector(selectCoverageWeek)
  const loading  = useSelector(selectCoverageLoading)
  const error    = useSelector(selectCoverageError)

  const gaugeColor =
    pct >= 80 ? '#10b981'
    : pct >= 60 ? '#f59e0b'
    : '#ef4444'

  const data = [{ value: pct, fill: gaugeColor }]

  // ✅ FIX ONLY HERE
  const today = new Date().toISOString().split('T')[0]

  return (
    <Card className="flex flex-col gap-5 h-full">
      <Card.Header>
        <Card.Title>Couverture Hebdomadaire</Card.Title>
        <span className="text-xs text-slate-400">Cette semaine</span>
      </Card.Header>

      {loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton.Block className="mx-auto h-40 w-40 rounded-full" />
          <div className="flex gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton.Block key={i} className="flex-1 h-16 rounded-lg" />
            ))}
          </div>
        </div>
      ) : error ? (
        <ErrorState message={error} size="sm" />
      ) : (
        <>
          <div className="relative mx-auto h-44 w-44">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 176, height: 176 }}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                barSize={12}
                data={data}
                startAngle={225}
                endAngle={-45}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background={{ fill: 'var(--bg-border)' }}
                  dataKey="value"
                  angleAxisId={0}
                  cornerRadius={6}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={pct}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold"
                style={{ color: gaugeColor }}
              >
                {pct}%
              </motion.span>
              <span className="text-xs text-slate-400">couverture</span>
            </div>
          </div>

          <div className="flex items-end gap-1.5">
            {weekData.map((day) => {
              const h = Math.max((day.coverage / 100) * 80, 4)

              // ✅ FIX ONLY HERE
              const isToday = day.date === today

              const color =
                day.coverage >= 80 ? 'bg-emerald-500'
                : day.coverage >= 60 ? 'bg-amber-500'
                : 'bg-red-400'

              return (
                <div
                  key={day.date}
                  className="group relative flex flex-1 flex-col items-center gap-1"
                >
                  <div className="absolute -top-10 left-1/2 hidden -translate-x-1/2
                                  whitespace-nowrap rounded-lg bg-slate-800 px-2 py-1
                                  text-xs text-white group-hover:block z-10">
                    {day.checked_in}/{day.assigned} • {day.coverage}%
                  </div>

                  <div className="flex w-full flex-col justify-end"
                       style={{ height: '80px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}px` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={cn(
                        'w-full rounded-sm transition-opacity',
                        color,
                        isToday
                          ? 'opacity-100 ring-2 ring-offset-1 ring-brand-400'
                          : 'opacity-70'
                      )}
                    />
                  </div>

                  <span className={cn(
                    'text-2xs font-medium',
                    isToday
                      ? 'text-brand-500 dark:text-brand-400'
                      : 'text-slate-400'
                  )}>
                    {DAY_LABELS[day.day_name] || day.day_name}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Card>
  )
}

export default CoverageGauge