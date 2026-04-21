import { useState, useRef, useEffect } from 'react'

const SASS_ANCHORS = [
  { level: 1, emoji: '🧑‍💼', name: 'BUTLER' },
  { level: 2, emoji: '🙂', name: 'FRIENDLY' },
  { level: 3, emoji: '😏', name: 'NORMAL' },
  { level: 4, emoji: '😈', name: 'SPICY' },
]

const RADIUS = 102
const ANGLES = [132, 104, 76, 48]
const ARC_OFFSET_X = -20
const FAN_POSITIONS = ANGLES.map((degree) => {
  const radians = (degree * Math.PI) / 180
  return {
    dx: Math.cos(radians) * RADIUS + ARC_OFFSET_X,
    dy: -Math.sin(radians) * RADIUS,
  }
})

function SassPicker({ level, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const current = SASS_ANCHORS.find((anchor) => anchor.level === level) ?? SASS_ANCHORS[2]

  useEffect(() => {
    if (!isOpen) return
    const handleClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  useEffect(() => {
    if (disabled) setIsOpen(false)
  }, [disabled])

  return (
    <div ref={containerRef} className="relative shrink-0 w-10 h-10 sm:w-11 sm:h-11">
      {SASS_ANCHORS.map((anchor, index) => {
        const { dx, dy } = FAN_POSITIONS[index]
        const isActive = anchor.level === level

        return (
          <div
            key={anchor.level}
            className="absolute group"
            style={{
              top: '50%',
              left: '50%',
              transform: isOpen
                ? `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1)`
                : 'translate(-50%, -50%) scale(0.3)',
              opacity: isOpen ? 1 : 0,
              transition: isOpen
                ? `transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 35}ms, opacity 160ms ease ${index * 35}ms`
                : 'transform 150ms ease-in, opacity 120ms ease',
              pointerEvents: isOpen ? 'auto' : 'none',
              zIndex: 40,
            }}
          >
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 label-mono text-[10px] bg-slate-900 text-slate-100 rounded-md px-2 py-0.5 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-150">
              {anchor.name}
            </span>

            <button
              disabled={disabled}
              onClick={() => {
                onChange(anchor.level)
                setIsOpen(false)
              }}
              aria-label={anchor.name}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg panel-solid hover:scale-110 active:scale-95 transition-transform duration-100 ${
                isActive ? 'ring-2 ring-[color:var(--accent)] ring-offset-2 ring-offset-transparent' : ''
              }`}
            >
              {anchor.emoji}
            </button>
          </div>
        )
      })}

      <button
        onClick={() => !disabled && setIsOpen((open) => !open)}
        disabled={disabled}
        aria-label={`Sass level: ${current.name}`}
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-base transition-all duration-150 ${
          isOpen
            ? 'text-white shadow-[0_10px_24px_rgba(0,122,198,0.35)] scale-105 [background:var(--user-surface)]'
            : disabled
            ? 'panel-solid text-[color:var(--text-secondary)] opacity-45 cursor-not-allowed'
            : 'panel-solid text-[color:var(--text-primary)] hover:brightness-105'
        }`}
      >
        {current.emoji}
      </button>
    </div>
  )
}

export default SassPicker
