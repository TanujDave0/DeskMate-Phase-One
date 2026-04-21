function MicButton({ isListening, isSupported, onClick, disabled }) {
  const isDisabled = !isSupported || disabled

  return (
    <div className="relative shrink-0">
      {isListening && (
        <span className="absolute inset-0 rounded-xl animate-ping opacity-60 [background:color-mix(in_srgb,var(--accent)_40%,transparent)]" />
      )}
      <button
        onClick={onClick}
        disabled={isDisabled}
        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
        className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-150 ${
          isListening
            ? 'text-white shadow-[0_10px_24px_rgba(0,122,198,0.35)] [background:var(--user-surface)]'
            : !isDisabled
            ? 'panel-solid text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:brightness-105'
            : 'panel-solid text-[color:var(--text-secondary)] opacity-45 cursor-not-allowed'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
        </svg>
      </button>
    </div>
  )
}

export default MicButton
