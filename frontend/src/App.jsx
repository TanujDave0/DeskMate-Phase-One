import { useState } from 'react'
import Header from './components/Header'
import ChatHistory from './components/ChatHistory'
import InputBar from './components/InputBar'
import { sendMessage } from './api'
import useTTS from './hooks/useTTS'

let nextId = 1

function App() {
  const [isDark, setIsDark] = useState(true)
  const [messages, setMessages] = useState([])
  const [sassLevel, setSassLevel] = useState(3)
  const [isLoading, setIsLoading] = useState(false)
  const { speak, isMuted, toggleMute, isSupported: ttsSupported } = useTTS()

  const handleSend = async (text) => {
    if (isLoading) return

    const userMsg = { id: nextId++, role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const responseText = await sendMessage({ text, sassLevel, history: messages })
      const botMsg = { id: nextId++, role: 'bot', text: responseText }
      setMessages((prev) => [...prev, botMsg])
      speak(responseText)
    } catch {
      const errorMsg = {
        id: nextId++,
        role: 'bot',
        text: "I couldn't process that right now. Please try again.",
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="h-screen flex flex-col app-shell transition-colors duration-300">
        <Header
          isDark={isDark}
          onToggle={() => setIsDark((value) => !value)}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          ttsSupported={ttsSupported}
        />

        <main className="flex-1 min-h-0 overflow-y-auto">
          <ChatHistory messages={messages} isLoading={isLoading} />
        </main>

        <InputBar
          onSend={handleSend}
          sassLevel={sassLevel}
          onSassChange={setSassLevel}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default App
