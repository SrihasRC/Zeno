'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ZenoAI } from '@/lib/ai/service'
import { actionExecutor, ActionResult } from '@/lib/ai/action-executor'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'action'
  content: string
  timestamp: Date
  actionResult?: ActionResult
}

interface AIChatProps {
  isOpen: boolean
  onToggle: () => void
}

export function AIChat({ isOpen, onToggle }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm Zara, your AI productivity assistant. I can help you manage tasks, start focus sessions, take notes, and analyze your productivity. What would you like to do?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const ai = useRef(new ZenoAI())

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const getUserContext = async () => {
    try {
      const [tasksRes, sessionsRes, goalsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/pomodoro'),
        fetch('/api/goals')
      ])

      const [tasks, sessions, goals] = await Promise.all([
        tasksRes.ok ? tasksRes.json() : [],
        sessionsRes.ok ? sessionsRes.json() : [],
        goalsRes.ok ? goalsRes.json() : []
      ])

      return {
        activeTasks: tasks.filter((task: { status: string }) => task.status !== 'done'),
        todaysSessions: sessions.length,
        pendingGoals: goals.filter((goal: { is_completed: boolean }) => !goal.is_completed),
        recentActivity: sessions.slice(-5)
      }
    } catch (error) {
      console.error('Failed to get user context:', error)
      return {
        activeTasks: [],
        todaysSessions: 0,
        pendingGoals: [],
        recentActivity: []
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Add user message
    addMessage({
      type: 'user',
      content: userMessage
    })

    try {
      // Get user context first
      const context = await getUserContext()
      
      // Get AI response
      const response = await ai.current.chat(userMessage, context)
      
      // Add AI response
      addMessage({
        type: 'assistant',
        content: response.response
      })

      // Execute actions if any
      if (response.actions && response.actions.length > 0) {
        for (const action of response.actions) {
          const result = await actionExecutor.executeAction(action)
          
          addMessage({
            type: 'action',
            content: `Executed: ${action.type}`,
            actionResult: result
          })
        }
      }
    } catch (error) {
      console.error('AI Chat error:', error)
      addMessage({
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <Bot className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Zara</h3>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 max-h-[360px]">
        <div className="space-y-4 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type !== 'user' && (
                <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                  {message.type === 'action' ? (
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  ) : (
                    <Bot className="h-3 w-3 text-purple-600" />
                  )}
                </div>
              )}
              
              <div className={`max-w-[75%] ${message.type === 'user' ? 'order-1' : ''}`}>
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    message.type === 'user'
                      ? 'bg-purple-600 text-white'
                      : message.type === 'action'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.type === 'action' && message.actionResult ? (
                    <div>
                      <div className="font-medium text-xs text-green-700 mb-1">
                        Action Result
                      </div>
                      <div className={`text-xs ${
                        message.actionResult.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {message.actionResult.message}
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="h-3 w-3 text-blue-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                <Loader2 className="h-3 w-3 text-purple-600 animate-spin" />
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  )
}

export function AIChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {children}
      <AIChat isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
    </>
  )
}
