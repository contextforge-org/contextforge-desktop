import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

/**
 * Generate initials from a name (up to 2 characters)
 * Examples: "GitHub" -> "GH", "My Server" -> "MS", "API" -> "AP"
 */
function getInitials(name: string): string {
  if (!name) return '??'
  
  // Split by spaces, hyphens, or underscores
  const words = name.trim().split(/[\s\-_]+/).filter(Boolean)
  
  if (words.length === 0) return '??'
  
  // If single word, take first 2 characters
  if (words.length === 1) {
    const word = words[0]
    return word.length >= 2 ? word.substring(0, 2).toUpperCase() : word.toUpperCase()
  }
  
  // If multiple words, take first character of first two words
  return (words[0][0] + words[1][0]).toUpperCase()
}

/**
 * Generate a consistent color based on the name
 * Uses a simple hash function to pick from a predefined color palette
 */
function getColorFromName(name: string): { bg: string; text: string } {
  const colors = [
    { bg: 'bg-blue-500', text: 'text-white' },
    { bg: 'bg-green-500', text: 'text-white' },
    { bg: 'bg-purple-500', text: 'text-white' },
    { bg: 'bg-orange-500', text: 'text-white' },
    { bg: 'bg-pink-500', text: 'text-white' },
    { bg: 'bg-teal-500', text: 'text-white' },
    { bg: 'bg-indigo-500', text: 'text-white' },
    { bg: 'bg-red-500', text: 'text-white' },
    { bg: 'bg-cyan-500', text: 'text-white' },
    { bg: 'bg-amber-500', text: 'text-white' },
  ]
  
  // Simple hash function
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackName?: string // Name to generate initials from
  showInitials?: boolean // Whether to show initials fallback (default: true)
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, fallbackName, showInitials = true, ...rest } = props
  
  // Check if src is empty or undefined
  const hasNoSrc = !src || src.trim() === ''
  
  // Show initials if enabled and either no src or error occurred
  const shouldShowInitials = showInitials && (hasNoSrc || didError)

  if (shouldShowInitials && fallbackName) {
    const initials = getInitials(fallbackName)
    const colors = getColorFromName(fallbackName)
    
    return (
      <div
        className={`flex items-center justify-center rounded-md ${colors.bg} ${colors.text} font-bold w-full h-full ${className ?? ''}`}
        style={style}
        title={fallbackName}
      >
        <span className="text-[1em] leading-none select-none">{initials}</span>
      </div>
    )
  }

  // Show error fallback if no initials should be shown
  if (didError || hasNoSrc) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    )
  }

  return (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}
