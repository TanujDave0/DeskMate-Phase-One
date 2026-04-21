import { useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import ThinkingBubble from './ThinkingBubble'

function ChatHistory({ messages, isLoading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-8">
        <div className="frosted soft-shadow rounded-3xl px-6 py-7 sm:px-8 sm:py-8 max-w-xl w-full text-center">
          <p className="label-mono text-xs text-[color:var(--accent)] mb-2">FUNBOT READY</p>
          <h2 className="text-xl sm:text-2xl font-semibold text-[color:var(--text-primary)]">
            Ask anything. Keep it useful.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[color:var(--text-secondary)]">
            Try weather, drafting, debugging, or quick explanations.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-3 sm:px-5 py-4 sm:py-7">
      <div className="flex flex-col gap-5">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <ThinkingBubble />}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}

export default ChatHistory
