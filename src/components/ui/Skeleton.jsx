import { cn } from '../../utils/cn'

/**
 * Skeleton — shimmer loading placeholder.
 *
 * Used everywhere data is loading to avoid blank screens.
 * Variants: line | circle | rect | card
 */

// Single shimmer block
const SkeletonBlock = ({ className }) => (
  <div className={cn(
    'shimmer rounded',
    className
  )} />
)

// Preset: text line
const SkeletonLine = ({ width = 'w-full', height = 'h-4', className }) => (
  <SkeletonBlock className={cn(width, height, className)} />
)

// Preset: circle (avatar)
const SkeletonCircle = ({ size = 'h-10 w-10', className }) => (
  <SkeletonBlock className={cn('rounded-full flex-shrink-0', size, className)} />
)

// Preset: stat card
const SkeletonCard = ({ className }) => (
  <div className={cn(
    'rounded-xl border border-surface-200 bg-white p-4',
    'dark:border-dark-600 dark:bg-dark-700',
    className
  )}>
    <div className="mb-3 flex items-center justify-between">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-8 w-8 rounded-lg" />
    </div>
    <SkeletonBlock className="mb-1.5 h-8 w-20" />
    <SkeletonBlock className="h-3 w-32" />
  </div>
)

// Preset: table row
const SkeletonRow = ({ cols = 5, className }) => (
  <div className={cn(
    'flex items-center gap-4 px-4 py-3',
    className
  )}>
    <SkeletonCircle size="h-8 w-8" />
    {Array.from({ length: cols - 1 }).map((_, i) => (
      <SkeletonBlock
        key={i}
        className={cn('h-3 flex-1', i === 0 ? 'max-w-32' : 'max-w-48')}
      />
    ))}
  </div>
)

// Compound export
const Skeleton = {
  Block:  SkeletonBlock,
  Line:   SkeletonLine,
  Circle: SkeletonCircle,
  Card:   SkeletonCard,
  Row:    SkeletonRow,
}

export default Skeleton