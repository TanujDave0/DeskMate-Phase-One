import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

function normalizeMathDelimiters(text) {
  return text
    .replace(/\\\[/g, '$$')
    .replace(/\\\]/g, '$$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$')
}

function remarkBreakTags() {
  return (tree) => {
    visitMarkdownNodes(tree, (node) => {
      if (node.type === 'html' && /^<br\s*\/?>$/i.test(node.value.trim())) {
        node.type = 'break'
        delete node.value
      }
    })
  }
}

function visitMarkdownNodes(node, visitor) {
  visitor(node)

  if (!Array.isArray(node.children)) {
    return
  }

  node.children.forEach((child) => visitMarkdownNodes(child, visitor))
}

const markdownComponents = {
  table({ children }) {
    return (
      <div className="my-3 w-full overflow-x-auto rounded-lg border border-[color:var(--panel-border)]">
        <table className="min-w-full border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    )
  },
  thead({ children }) {
    return <thead className="bg-[color:var(--panel)]">{children}</thead>
  },
  th({ children }) {
    return (
      <th className="whitespace-nowrap border-b border-r border-[color:var(--panel-border)] px-3 py-2 font-semibold last:border-r-0">
        {children}
      </th>
    )
  },
  td({ children }) {
    return (
      <td className="border-b border-r border-[color:var(--panel-border)] px-3 py-2 align-top last:border-r-0">
        {children}
      </td>
    )
  },
  tr({ children }) {
    return <tr className="last:[&>td]:border-b-0">{children}</tr>
  },
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  const messageText = isUser ? message.text : normalizeMathDelimiters(message.text)

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[86%] sm:max-w-[72%] rounded-3xl rounded-br-lg px-4 sm:px-5 py-3 text-sm sm:text-[15px] leading-relaxed text-white shadow-[0_14px_34px_rgba(5,74,119,0.35)] [background:var(--user-surface)]">
          {messageText}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className="label-mono text-[10px] sm:text-xs text-[color:var(--accent)] pl-1">
        FUNBOT
      </span>
      <div className="max-w-[90%] sm:max-w-[78%] px-4 sm:px-5 py-3 rounded-3xl rounded-bl-lg text-sm sm:text-[15px] leading-relaxed text-[color:var(--text-primary)] panel-solid soft-shadow [background:var(--bot-surface)]">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath, remarkBreakTags]}
            rehypePlugins={[rehypeKatex]}
            components={markdownComponents}
          >
            {messageText}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
