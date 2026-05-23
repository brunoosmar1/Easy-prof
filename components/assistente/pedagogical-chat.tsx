'use client'

import { useState, useRef, useEffect } from 'react'
import { chatWithAssistant } from '@/lib/actions/ai'
import { ChatMessage, Class } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Send, Sparkles, Bot, User, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

const QUICK_PROMPTS = [
  'Crie 5 questões de múltipla escolha sobre fotossíntese para o 6º ano',
  'Sugira 3 metodologias ativas para trabalhar frações com o 5º ano',
  'Como fazer recuperação paralela eficaz para alunos com dificuldades em leitura?',
  'Crie uma rubrica de avaliação para apresentação oral',
  'Sugira atividades lúdicas para trabalhar alfabetização',
]

export function PedagogicalChat({ classes }: { classes: Class[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Olá! Sou o Assistente Pedagógico do EasyProf 👋\n\nEstou aqui para ajudar você com:\n• Criar atividades e avaliações\n• Sugerir metodologias de ensino\n• Adaptar conteúdos para diferentes níveis\n• Elaborar planos de aula e rubricas\n• Estratégias de recuperação paralela\n\nComo posso ajudar hoje?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectedClassData = classes.find((c) => c.id === selectedClass)
  const classContext = selectedClassData
    ? {
        grade: selectedClassData.grade,
        subject: selectedClassData.subject,
        studentCount: 0,
      }
    : undefined

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    const conversationHistory = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const result = await chatWithAssistant(conversationHistory, classContext)
    setLoading(false)

    if (result.error) {
      toast({ title: 'Erro', description: result.error, variant: 'destructive' })
    } else {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.data || '',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
      {/* Context selector */}
      <div className="mb-4">
        <Select onValueChange={setSelectedClass} value={selectedClass}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Selecionar turma (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sem contexto de turma</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name} — {cls.grade} · {cls.subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Messages */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-3',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        {messages.length === 1 && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              Sugestões rápidas
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-300 hover:text-brand-600 transition-colors text-left"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt.slice(0, 50)}...
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
              rows={2}
              className="flex-1 resize-none"
              disabled={loading}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              variant="brand"
              size="icon"
              className="h-auto aspect-square"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-400" />
            Assistente especializado em educação básica brasileira
          </p>
        </div>
      </Card>
    </div>
  )
}
