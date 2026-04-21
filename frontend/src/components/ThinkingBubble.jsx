import { useEffect, useState } from 'react'

const SPINNER_FRAMES = ['.', 'o', 'O', 'o']
const VERBS = ['Thinking', 'Crafting', 'Computing', 'Considering', 'Processing']

function ThinkingBubble() {
  const [frameIndex, setFrameIndex] = useState(0)
  const [verbIndex, setVerbIndex] = useState(0)

  useEffect(() => {
    const frameTimer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % SPINNER_FRAMES.length)
    }, 120)

    const verbTimer = setInterval(() => {
      setVerbIndex((prev) => (prev + 1) % VERBS.length)
    }, 1400)

    return () => {
      clearInterval(frameTimer)
      clearInterval(verbTimer)
    }
  }, [])

  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className="label-mono text-[10px] sm:text-xs text-[color:var(--accent)] pl-1">
        FUNBOT
      </span>
      <div className="max-w-[90%] sm:max-w-[78%] rounded-3xl rounded-bl-lg px-4 sm:px-5 py-3 panel-solid soft-shadow [background:var(--bot-surface)] flex items-center gap-2">
        <span aria-hidden="true" className="inline-block w-4 text-center text-[color:var(--accent)] font-semibold">
          {SPINNER_FRAMES[frameIndex]}
        </span>
        <span className="label-mono text-xs sm:text-sm text-[color:var(--text-secondary)]">
          {VERBS[verbIndex]}...
        </span>
      </div>
    </div>
  )
}

export default ThinkingBubble
