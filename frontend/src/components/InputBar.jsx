import { useState, useCallback } from 'react'
import MicButton from './MicButton'
import SassPicker from './SassPicker'
import useSpeech from '../hooks/useSpeech'

function InputBar({ onSend, sassLevel, onSassChange, isLoading }) {
  const [input, setInput] = useState('')

  const handleResult = useCallback((text) => setInput(text), [])
  const { isListening, isSupported, start, stop } = useSpeech({ onResult: handleResult })

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setInput('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleMic = () => {
    if (isLoading) return
    if (isListening) {
      stop()
    } else {
      start()
    }
  }

  return (
    <footer className="shrink-0 px-3 pb-3 sm:px-6 sm:pb-5">
      <div className="frosted soft-shadow max-w-4xl mx-auto rounded-2xl p-2.5 sm:p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-2xl px-3 sm:px-4 py-2.5 panel-solid [background:color-mix(in_srgb,var(--panel-strong)_86%,transparent)]">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? 'DESKMATE is thinking...' : isListening ? 'Listening...' : 'Message DESKMATE...'}
              disabled={isLoading}
              className="flex-1 bg-transparent outline-none text-sm sm:text-[15px] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white transition-all duration-150 enabled:shadow-[0_8px_24px_rgba(0,111,178,0.42)] enabled:hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed [background:var(--user-surface)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>

          <MicButton
            isListening={isListening}
            isSupported={isSupported}
            onClick={handleMic}
            disabled={isLoading}
          />

          <SassPicker level={sassLevel} onChange={onSassChange} disabled={isLoading} />
        </div>
      </div>
    </footer>
  )
}

export default InputBar
