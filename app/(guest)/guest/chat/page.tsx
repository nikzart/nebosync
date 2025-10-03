'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Image, Mic, Paperclip } from 'lucide-react'
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
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

  // Mark messages as read when there are unread messages from staff
  useEffect(() => {
    if (!messages || messages.length === 0) return

    // Check if there are any unread messages from staff
    const hasUnreadFromStaff = messages.some(m => !m.isRead && !m.isFromGuest)

    if (hasUnreadFromStaff) {
      // Mark them as read
      const markAsRead = async () => {
        try {
          await fetch('/api/messages', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          })
          // Invalidate guest unread count to update badge
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          messageType: 'TEXT',
        }),
      })
      if (!res.ok) throw new Error('Failed to send message')
      return res.json()
    },
    onSuccess: (newMessage) => {
      // Optimistic update
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

  return (
    <div className="fixed inset-0 bottom-20 bg-gradient-to-br from-purple-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Chat with Staff</h1>
            <p className="text-sm text-gray-500">
              Get help from our team
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-pastel-purple border-t-transparent rounded-full" />
          </div>
        ) : messages && messages.length > 0 ? (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isOwnMessage = msg.isFromGuest === (session?.user?.role === 'GUEST')
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-3xl px-5 py-3 ${
                      isOwnMessage
                        ? 'bg-lime-accent text-black'
                        : 'bg-white text-gray-900 shadow-sm'
                    }`}
                  >
                    {!isOwnMessage && msg.staff && (
                      <p className="text-xs text-gray-500 mb-1 font-medium">
                        {msg.staff.name} ({msg.staff.role})
                      </p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-black/60' : 'text-gray-400'
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
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400">
                Start a conversation with our staff
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <Image className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 h-10 rounded-full bg-gray-100 border-none"
          />
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Mic className="w-5 h-5 text-gray-600" />
          </button>
          <Button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="w-10 h-10 rounded-full bg-lime-accent hover:bg-lime-accent/90 p-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
