import { useState, memo } from 'react'
import { getAvatarData } from '../../utils/avatarGenerator'
import { cn } from '../../utils/cn'

/**
 * Avatar
 *
 * Renders user avatar image when available.
 * Falls back to initials + deterministic gradient when:
 *   - No src provided
 *   - Image fails to load
 *
 * Sizes: xs(24) | sm(32) | md(40) | lg(48) | xl(64) | 2xl(96)
 *
 * Backend field: user.avatar_url (public URL added via accessor in fix #4)
 */

const SIZE_CLASSES = {
  xs:  'h-6 w-6 text-2xs',
  sm:  'h-8 w-8 text-xs',
  md:  'h-10 w-10 text-sm',
  lg:  'h-12 w-12 text-sm',
  xl:  'h-16 w-16 text-base',
  '2xl': 'h-24 w-24 text-xl',
}

const Avatar = ({
  src,
  name = '',
  size = 'md',
  className,
  ring = false,
  ringColor = 'ring-white dark:ring-dark-700',
  onClick,
}) => {
  const [imgError, setImgError] = useState(false)
  const { initials, gradient }  = getAvatarData(name)
  const showImage               = src && !imgError
  const sizeClass               = SIZE_CLASSES[size] || SIZE_CLASSES.md

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative flex-shrink-0 select-none overflow-hidden rounded-full',
        'flex items-center justify-center font-semibold',
        sizeClass,
        ring && `ring-2 ${ringColor}`,
        onClick && 'cursor-pointer transition-opacity hover:opacity-90',
        className
      )}
      style={!showImage ? { background: gradient } : undefined}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-white leading-none select-none">
          {initials}
        </span>
      )}
    </div>
  )
}

export default memo(Avatar)