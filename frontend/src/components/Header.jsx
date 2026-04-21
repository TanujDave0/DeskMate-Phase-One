function Header({ isDark, onToggle, isMuted, onToggleMute, ttsSupported }) {
  return (
    <header className="shrink-0 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="frosted soft-shadow max-w-4xl mx-auto rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="label-mono font-semibold text-sm sm:text-base">
            <span className="text-[color:var(--text-primary)]">FUN</span>
            <span className="text-[color:var(--accent)]">BOT</span>
          </h1>
          <p className="text-xs sm:text-sm text-[color:var(--text-secondary)] truncate">
            Utility first. Personality on top.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {ttsSupported && (
            <button
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="rounded-xl px-3 py-2 panel-solid text-[color:var(--text-primary)] hover:brightness-105 active:scale-[0.98] transition-all duration-150 flex items-center gap-2"
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M13 3.586L7.707 8.293A1 1 0 017 8.586H4a1 1 0 00-1 1v5a1 1 0 001 1h3a1 1 0 01.707.293L13 20.414V3.586zM15 12l1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5 1.5-1.5L15 12z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M13 3.586L7.707 8.293A1 1 0 017 8.586H4a1 1 0 00-1 1v5a1 1 0 001 1h3a1 1 0 01.707.293L13 20.414V3.586zM15.536 8.464a5 5 0 010 7.072l-1.414-1.414a3 3 0 000-4.244l1.414-1.414zm2.828-2.828a9 9 0 010 12.728l-1.414-1.414a7 7 0 000-9.9l1.414-1.414z" />
                </svg>
              )}
              <span className="label-mono text-xs">{isMuted ? 'MUTED' : 'VOICE'}</span>
            </button>
          )}

          <button
            onClick={onToggle}
            aria-label="Toggle theme"
            className="rounded-xl px-3 py-2 panel-solid text-[color:var(--text-primary)] hover:brightness-105 active:scale-[0.98] transition-all duration-150 flex items-center gap-2"
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 14a4 4 0 100-8 4 4 0 000 8zm8-5a1 1 0 100 2h2a1 1 0 100-2h-2zM2 11a1 1 0 100 2h2a1 1 0 100-2H2zm15.657-6.243a1 1 0 010 1.414l-1.415 1.415a1 1 0 01-1.414-1.415l1.414-1.414a1 1 0 011.415 0zm-9.9 9.9a1 1 0 010 1.414L6.343 17.49a1 1 0 11-1.414-1.414l1.414-1.415a1 1 0 011.414 0zm9.9 2.829a1 1 0 01-1.415 0l-1.414-1.415a1 1 0 011.414-1.414l1.415 1.414a1 1 0 010 1.415zm-9.9-9.9a1 1 0 01-1.414 0L4.93 6.172a1 1 0 011.414-1.415L7.757 6.17a1 1 0 010 1.415z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M20.742 13.045a1 1 0 00-1.153-.242 7 7 0 01-9.392-8.638 1 1 0 00-1.394-1.197A10 10 0 1012 22a10 10 0 008.742-8.955z" />
              </svg>
            )}
            <span className="label-mono text-xs">{isDark ? 'LIGHT' : 'DARK'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
