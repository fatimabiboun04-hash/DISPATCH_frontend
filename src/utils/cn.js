import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility: merge Tailwind classes safely.
 * Resolves conflicts (e.g. bg-red-500 + bg-blue-500 → bg-blue-500).
 *
 * Usage: cn('base-class', condition && 'conditional-class', props.className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}