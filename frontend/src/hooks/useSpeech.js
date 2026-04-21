import { useState, useRef, useEffect, useCallback } from 'react'

function useSpeech({ onResult }) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)
  const onResultRef = useRef(onResult)

  // Keep ref current so recognition handler never closes over a stale callback
  onResultRef.current = onResult

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const start = useCallback(() => {
    if (!isSupported || isListening) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onResultRef.current(transcript)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, isListening])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  // Abort if component unmounts mid-recording
  useEffect(() => {
    return () => recognitionRef.current?.abort()
  }, [])

  return { isListening, isSupported, start, stop }
}

export default useSpeech
