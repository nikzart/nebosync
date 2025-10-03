'use client'

import { use, useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Trash2 } from 'lucide-react'
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

export default function StaffChatPage({ params }: { params: Promise<{ guestId: string }> }) {
  // Unwrap params Promise for Next.js 15
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
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

  // Mark messages as read when there are unread messages from guest
  useEffect(() => {
    if (!messages || messages.length === 0) return

    // Check if there are any unread messages from the guest
    const hasUnreadFromGuest = messages.some(m => !m.isRead && m.isFromGuest)

    if (hasUnreadFromGuest) {
      // Mark them as read
      const markAsRead = async () => {
        try {
          await fetch('/api/messages', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ guestId }),
          })
          // Invalidate header stats to update unread count immediately
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
      // Optimistic update
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
      toast.success('Chat cleared successfully')
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
    if (confirm('Are you sure you want to clear all messages in this chat? This action cannot be undone.')) {
      await clearChatMutation.mutateAsync()
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{guest?.name || 'Guest'}</h1>
            <p className="text-sm text-muted-foreground">
              {guest?.room ? `Room ${guest.room.roomNumber}` : guest?.phone}
            </p>
          </div>
          {/* Clear Chat button - Admin only */}
          {session?.user?.role === 'ADMIN' && (
            <button
              onClick={handleClearChat}
              disabled={clearChatMutation.isPending}
              className="w-10 h-10 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors disabled:opacity-50"
              title="Clear Chat (Admin Only)"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : messages && messages.length > 0 ? (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isOwnMessage = !msg.isFromGuest
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card'
                    }`}
                  >
                    {!isOwnMessage && (
                      <p className="text-xs text-muted-foreground mb-1 font-medium">
                        {msg.guest.name}
                      </p>
                    )}
                    {isOwnMessage && msg.staff && (
                      <p className="text-xs text-primary-foreground/70 mb-1 font-medium">
                        {msg.staff.name} ({msg.staff.role})
                      </p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage
                          ? 'text-primary-foreground/60'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Start a conversation with this guest
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-card border-t px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="px-6"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
