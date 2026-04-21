import { useState, useCallback, useEffect } from 'react'

function useTTS() {
  const [isMuted, setIsMuted] = useState(false)

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = useCallback(
    (text) => {
      if (!isSupported || isMuted) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      window.speechSynthesis.speak(utterance)
    },
    [isSupported, isMuted],
  )

  const toggleMute = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsMuted((prev) => !prev)
  }, [isSupported])

  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel()
    }
  }, [isSupported])

  return { speak, isMuted, toggleMute, isSupported }
}

export default useTTS
