'use client'

import { use, useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Trash2, Circle, Check, CheckCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

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
    room: {
      roomNumber: string
    } | null
  }
}

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
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default function StaffChatPage({ params }: { params: Promise<{ guestId: string }> }) {
  const { guestId } = use(params)

  const router = useRouter()
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ['staff-chat-messages', guestId],
    queryFn: async () => {
      const res = await fetch(`/api/messages?guestId=${guestId}`)
      if (!res.ok) throw new Error('Failed to fetch messages')
      return res.json()
    },
    refetchInterval: 2000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

  // Mark messages as read when there are unread messages from guest
  useEffect(() => {
    if (!messages || messages.length === 0) return

    const hasUnreadFromGuest = messages.some(m => !m.isRead && m.isFromGuest)

    if (hasUnreadFromGuest) {
      const markAsRead = async () => {
        try {
          await fetch('/api/messages', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ guestId }),
          })
          queryClient.invalidateQueries({ queryKey: ['header-quick-stats'] })
        } catch (error) {
          console.error('Failed to mark messages as read:', error)
        }
      }
      markAsRead()
    }
  }, [messages, guestId, queryClient])

  const { data: guest } = useQuery({
    queryKey: ['guest', guestId],
    queryFn: async () => {
      const res = await fetch('/api/guests')
      if (!res.ok) throw new Error('Failed to fetch guests')
      const guests = await res.json()
      return guests.find((g: any) => g.id === guestId)
    },
  })

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          messageType: 'TEXT',
          guestId: guestId,
        }),
      })
      if (!res.ok) throw new Error('Failed to send message')
      return res.json()
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<Message[]>(
        ['staff-chat-messages', guestId],
        (old) => [...(old || []), newMessage]
      )
    },
    onError: () => {
      toast.error('Failed to send message')
    },
  })

  const clearChatMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/messages', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestId }),
      })
      if (!res.ok) throw new Error('Failed to clear chat')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-chat-messages', guestId] })
      queryClient.invalidateQueries({ queryKey: ['header-quick-stats'] })
      toast.success('Chat cleared')
    },
    onError: () => {
      toast.error('Failed to clear chat')
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

  const handleClearChat = async () => {
    if (confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
      await clearChatMutation.mutateAsync()
    }
  }

  // Determine if we should show a date separator before a message
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

  function getBubbleRadius(isOwn: boolean, isFirst: boolean, isLast: boolean): string {
    const r = '1.25rem'
    const sm = '0.25rem'
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

  const guestName = guest?.name || 'Guest'

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <header className="shrink-0 bg-card/80 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Back button — mobile only (list is visible on desktop) */}
          <button
            onClick={() => router.push('/staff/messages')}
            className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors lg:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Avatar */}
          <div className="relative">
            <div className={`w-9 h-9 rounded-full ${getInitialColor(guestName)} flex items-center justify-center text-white font-semibold text-xs`}>
              {guestName.charAt(0).toUpperCase()}
            </div>
            {guest?.isActive && (
              <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-emerald-500 text-card stroke-[3]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold leading-tight truncate">{guestName}</h1>
            <p className="text-xs text-muted-foreground">
              {guest?.room ? `Room ${guest.room.roomNumber}` : guest?.phone}
              {guest?.isActive && <span className="text-emerald-500 ml-1.5">· Online</span>}
            </p>
          </div>

          {/* Clear Chat - Admin only */}
          {session?.user?.role === 'ADMIN' && (
            <button
              onClick={handleClearChat}
              disabled={clearChatMutation.isPending}
              className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors disabled:opacity-50"
              title="Clear Chat"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 bg-muted/10">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : messages && messages.length > 0 ? (
          <div>
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isOwn = !msg.isFromGuest
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
                        <span className="text-[11px] font-medium text-muted-foreground bg-muted/80 rounded-full px-3 py-1">
                          {formatDateSeparator(new Date(msg.createdAt))}
                        </span>
                      </div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.12 }}
                      className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'} ${
                        isFirst ? 'mt-3' : 'mt-[3px]'
                      }`}
                    >
                      {/* Guest avatar — only on last message of group */}
                      {!isOwn && (
                        <div className="w-7 shrink-0">
                          {showAvatar ? (
                            <div className={`w-7 h-7 rounded-full ${getInitialColor(msg.guest.name)} flex items-center justify-center text-white text-[10px] font-bold`}>
                              {msg.guest.name.charAt(0).toUpperCase()}
                            </div>
                          ) : null}
                        </div>
                      )}

                      <div
                        className={`max-w-[70%] px-3 py-2 overflow-hidden ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                        }`}
                        style={{ borderRadius: radius }}
                      >
                        {isFirst && !isOwn && (
                          <p className="text-[11px] font-semibold text-primary/80 mb-0.5">
                            {msg.guest.name}
                          </p>
                        )}
                        {isFirst && isOwn && msg.staff && (
                          <p className="text-[11px] font-medium text-primary-foreground/50 mb-0.5">
                            {msg.staff.name}
                          </p>
                        )}

                        <p className="text-[0.9rem] leading-relaxed break-words">{msg.content}</p>
                        <div className={`flex items-center gap-1 justify-end mt-0.5 ${
                          isOwn ? 'text-primary-foreground/40' : 'text-muted-foreground/50'
                        }`}>
                          <span className="text-[10px] leading-none">{time}</span>
                          {isOwn && (
                            msg.isRead
                              ? <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/60" />
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
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-3">
                <Send className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-0.5">No messages yet</p>
              <p className="text-xs text-muted-foreground/50">
                Send a message to start the conversation
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 bg-card border-t px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2.5">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 h-11 rounded-full bg-muted/50 border-0 px-4 focus-visible:ring-1 text-sm"
          />
          <Button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            size="icon"
            className="w-10 h-10 rounded-full shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
