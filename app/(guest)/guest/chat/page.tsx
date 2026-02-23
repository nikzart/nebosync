'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Check, CheckCheck, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  messageType: string
  createdAt: string
  isRead: boolean
  isFromGuest: boolean
  staff?: {
    id: string
    name: string
    role: string
  } | null
  guest: {
    id: string
    name: string
    room: { roomNumber: string } | null
  }
}

// --- Ported from staff chat: utility functions ---

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

function formatDateSeparator(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getInitialColor(name: string): string {
  const colors = [
    'bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-600',
    'bg-rose-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-teal-600',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getBubbleRadius(isOwn: boolean, isFirst: boolean, isLast: boolean): string {
  const r = '1.25rem'
  const sm = '0.25rem'
  // Own messages (guest) are right-aligned, staff messages are left-aligned
  if (isOwn) {
    if (isFirst && isLast) return `${r} ${r} ${sm} ${r}`
    if (isFirst) return `${r} ${r} ${sm} ${r}`
    if (isLast) return `${r} ${sm} ${sm} ${r}`
    return `${r} ${sm} ${sm} ${r}`
  }
  if (isFirst && isLast) return `${r} ${r} ${r} ${sm}`
  if (isFirst) return `${r} ${r} ${r} ${sm}`
  if (isLast) return `${sm} ${r} ${r} ${sm}`
  return `${sm} ${r} ${r} ${sm}`
}

export default function ChatPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      const res = await fetch('/api/messages')
      if (!res.ok) throw new Error('Failed to fetch messages')
      return res.json()
    },
    refetchInterval: 2000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

  // Mark staff messages as read
  useEffect(() => {
    if (!messages || messages.length === 0) return
    const hasUnreadFromStaff = messages.some(m => !m.isRead && !m.isFromGuest)
    if (hasUnreadFromStaff) {
      const markAsRead = async () => {
        try {
          await fetch('/api/messages', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          })
          queryClient.invalidateQueries({ queryKey: ['guest-unread-messages'] })
        } catch (error) {
          console.error('Failed to mark messages as read:', error)
        }
      }
      markAsRead()
    }
  }, [messages, queryClient])

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, messageType: 'TEXT' }),
      })
      if (!res.ok) throw new Error('Failed to send message')
      return res.json()
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<Message[]>(['messages'], (old) => [
        ...(old || []),
        newMessage,
      ])
    },
    onError: () => {
      toast.error('Failed to send message')
    },
  })

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    const messageToSend = message
    setMessage('')
    await sendMessageMutation.mutateAsync(messageToSend)
  }

  // --- Grouping logic (ported from staff chat) ---

  function shouldShowDateSeparator(index: number): boolean {
    if (!messages) return false
    if (index === 0) return true
    const prev = new Date(messages[index - 1].createdAt)
    const curr = new Date(messages[index].createdAt)
    return !isSameDay(prev, curr)
  }

  function isSameSenderAsPrev(index: number): boolean {
    if (!messages || index === 0) return false
    const prev = messages[index - 1]
    const curr = messages[index]
    if (prev.isFromGuest !== curr.isFromGuest) return false
    const prevTime = new Date(prev.createdAt).getTime()
    const currTime = new Date(curr.createdAt).getTime()
    return (currTime - prevTime) < 120000
  }

  function isSameSenderAsNext(index: number): boolean {
    if (!messages || index === messages.length - 1) return false
    const curr = messages[index]
    const next = messages[index + 1]
    if (curr.isFromGuest !== next.isFromGuest) return false
    const currTime = new Date(curr.createdAt).getTime()
    const nextTime = new Date(next.createdAt).getTime()
    return (nextTime - currTime) < 120000
  }

  return (
    <div className="fixed inset-0 bottom-[88px] bg-[#FAF9F6] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FAF9F6]/90 backdrop-blur-lg border-b border-[#EDECEA] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2D5A3D] flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-[#1C1C1C]">Hotel Concierge</h1>
            <p className="text-[12px] text-[#A1A1A1]">Usually replies within minutes</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-5 h-5 border-2 border-[#2D5A3D] border-t-transparent rounded-full" />
          </div>
        ) : messages && messages.length > 0 ? (
          <div>
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isOwn = msg.isFromGuest
                const showDate = shouldShowDateSeparator(index)
                const isFirst = !isSameSenderAsPrev(index)
                const isLast = !isSameSenderAsNext(index)
                const showAvatar = !isOwn && isLast
                const radius = getBubbleRadius(isOwn, isFirst, isLast)
                const time = new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div key={msg.id}>
                    {/* Date separator */}
                    {showDate && (
                      <div className="flex justify-center py-4">
                        <span className="text-[11px] font-medium text-[#A1A1A1] bg-white rounded-full px-3 py-1 border border-[#EDECEA]">
                          {formatDateSeparator(new Date(msg.createdAt))}
                        </span>
                      </div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.12 }}
                      className={cn(
                        'flex items-end gap-2',
                        isOwn ? 'justify-end' : 'justify-start',
                        isFirst ? 'mt-3' : 'mt-[3px]'
                      )}
                    >
                      {/* Staff avatar — only on last message of received group */}
                      {!isOwn && (
                        <div className="w-7 shrink-0">
                          {showAvatar && msg.staff ? (
                            <div className={cn(
                              'w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold',
                              getInitialColor(msg.staff.name)
                            )}>
                              {msg.staff.name.charAt(0).toUpperCase()}
                            </div>
                          ) : null}
                        </div>
                      )}

                      <div
                        className={cn(
                          'max-w-[70%] px-3 py-2 overflow-hidden',
                          isOwn
                            ? 'bg-[#2D5A3D] text-white'
                            : 'bg-[#F2F0EC] text-[#1C1C1C]'
                        )}
                        style={{ borderRadius: radius }}
                      >
                        {/* Staff name on first message of received group */}
                        {isFirst && !isOwn && msg.staff && (
                          <p className="text-[11px] font-semibold text-[#2D5A3D] mb-0.5">
                            {msg.staff.name}
                          </p>
                        )}

                        <p className="text-[0.9rem] leading-relaxed break-words">{msg.content}</p>

                        {/* Time + read receipts */}
                        <div className={cn(
                          'flex items-center gap-1 justify-end mt-0.5',
                          isOwn ? 'text-white/40' : 'text-[#A1A1A1]'
                        )}>
                          <span className="text-[10px] leading-none">{time}</span>
                          {isOwn && (
                            msg.isRead
                              ? <CheckCheck className="w-3.5 h-3.5 text-[#C9A96E]" />
                              : <Check className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 h-full px-8">
            <div className="w-14 h-14 rounded-full bg-[#EBF3ED] flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-[#2D5A3D]" />
            </div>
            <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-1">Start a conversation</h2>
            <p className="text-[13px] text-[#A1A1A1] text-center">
              Our concierge team is here to help with anything you need
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 z-10 bg-[#FAF9F6] border-t border-[#EDECEA] px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 h-10 rounded-full bg-white border border-[#EDECEA] px-4 text-[14px] placeholder:text-[#A1A1A1] focus:outline-none focus:border-[#2D5A3D] transition-colors"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              message.trim() ? 'bg-[#2D5A3D]' : 'bg-[#EDECEA]'
            )}
          >
            <Send className={cn(
              'w-4 h-4',
              message.trim() ? 'text-white' : 'text-[#A1A1A1]'
            )} />
          </motion.button>
        </form>
      </div>
    </div>
  )
}
