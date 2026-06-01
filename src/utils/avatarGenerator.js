/**
 * Avatar generator — returns initials and a consistent gradient background.
 * Used when user has no uploaded avatar image.
 */

// Gradient palette — deterministic based on name
const GRADIENTS = [
  ['#6172f3', '#8098f9'],  // blue-indigo
  ['#10b981', '#34d399'],  // emerald
  ['#f59e0b', '#fbbf24'],  // amber
  ['#ef4444', '#f87171'],  // red
  ['#8b5cf6', '#c4b5fd'],  // violet
  ['#06b6d4', '#67e8f9'],  // cyan
  ['#f43f5e', '#fb7185'],  // rose
  ['#84cc16', '#bef264'],  // lime
  ['#0ea5e9', '#7dd3fc'],  // sky
  ['#d946ef', '#f0abfc'],  // fuchsia
]

/**
 * Returns a deterministic gradient index based on the name string.
 */
const getGradientIndex = (name) => {
  if (!name) return 0
  const sum = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return sum % GRADIENTS.length
}

/**
 * Extract initials from a full name.
 * 'Fatima Ahmed' → 'FA'
 * 'John' → 'JO'
 */
export const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Returns CSS gradient string for use as background.
 */
export const getAvatarGradient = (name) => {
  const [from, to] = GRADIENTS[getGradientIndex(name)]
  return `linear-gradient(135deg, ${from}, ${to})`
}

/**
 * Returns both initials and gradient — the main export.
 * Usage:
 *   const { initials, gradient } = getAvatarData('Fatima Ahmed')
 *   <div style={{ background: gradient }}>{initials}</div>
 */
export const getAvatarData = (name) => ({
  initials: getInitials(name),
  gradient: getAvatarGradient(name),
})

/**
 * Returns a color (hex) from the gradient for use in team badges etc.
 */
export const getAvatarColor = (name) => GRADIENTS[getGradientIndex(name)][0]