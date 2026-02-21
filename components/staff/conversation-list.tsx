'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Search, Circle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface Guest {
  id: string
  name: string
  phone: string
  isActive: boolean
  room: {
    roomNumber: string
  } | null
}

interface Message {
  id: string
  content: string
  isFromGuest: boolean
  isRead: boolean
  createdAt: string
}

interface GuestWithLastMessage extends Guest {
  lastMessage?: Message
  unreadCount: number
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m`
  if (diffHr < 24) return `${diffHr}h`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
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

export function ConversationList() {
  const params = useParams()
  const activeGuestId = params?.guestId as string | undefined
  const [searchQuery, setSearchQuery] = useState('')

  const { data: guests, isLoading } = useQuery<GuestWithLastMessage[]>({
    queryKey: ['staff-messages'],
    queryFn: async () => {
      const res = await fetch('/api/guests')
      if (!res.ok) throw new Error('Failed to fetch guests')
      const guestsData = await res.json()

      const guestsWithMessages = await Promise.all(
        guestsData.map(async (guest: Guest) => {
          try {
            const messagesRes = await fetch(`/api/messages?guestId=${guest.id}`)
            const messages = await messagesRes.json()
            const lastMessage = messages[messages.length - 1]
            const unreadCount = messages.filter(
              (m: Message) => !m.isRead && m.isFromGuest
            ).length

            return {
              ...guest,
              lastMessage,
              unreadCount,
            }
          } catch {
            return {
              ...guest,
              unreadCount: 0,
            }
          }
        })
      )

      guestsWithMessages.sort((a: GuestWithLastMessage, b: GuestWithLastMessage) => {
        if (!a.lastMessage && !b.lastMessage) return 0
        if (!a.lastMessage) return 1
        if (!b.lastMessage) return -1
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
      })

      return guestsWithMessages
    },
    refetchInterval: 5000,
  })

  const filteredGuests = guests?.filter((guest) =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.room?.roomNumber.includes(searchQuery)
  )

  const guestsWithMessages = filteredGuests?.filter(g => g.lastMessage)
  const guestsWithoutMessages = filteredGuests?.filter(g => !g.lastMessage)

  return (
    <>
      {/* Header */}
      <div className="shrink-0 p-4 pb-3">
        <h2 className="text-lg font-bold mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 rounded-lg bg-muted/50 border-0 focus-visible:ring-1 text-sm"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1 px-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-2">
            {guestsWithMessages?.map((guest) => {
              const isActive = guest.id === activeGuestId

              return (
                <Link
                  key={guest.id}
                  href={`/staff/messages/${guest.id}`}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors mb-0.5 ${
                    isActive
                      ? 'bg-primary/10 text-foreground'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full ${getInitialColor(guest.name)} flex items-center justify-center text-white font-semibold text-xs`}>
                      {guest.name.charAt(0).toUpperCase()}
                    </div>
                    {guest.isActive && (
                      <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-emerald-500 text-card stroke-[3]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold truncate">
                        {guest.name}
                      </span>
                      {guest.lastMessage && (
                        <span className={`text-[10px] shrink-0 ml-1.5 ${guest.unreadCount > 0 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                          {formatRelativeTime(guest.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs truncate ${guest.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {guest.lastMessage?.isFromGuest ? '' : 'You: '}
                        {guest.lastMessage?.content}
                      </span>
                      {guest.unreadCount > 0 && (
                        <span className="shrink-0 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full flex items-center justify-center">
                          {guest.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}

            {/* Guests without messages */}
            {guestsWithoutMessages && guestsWithoutMessages.length > 0 && (
              <>
                <div className="px-3 py-2 mt-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    No messages yet
                  </span>
                </div>
                {guestsWithoutMessages.map((guest) => {
                  const isActive = guest.id === activeGuestId

                  return (
                    <Link
                      key={guest.id}
                      href={`/staff/messages/${guest.id}`}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors mb-0.5 ${
                        isActive
                          ? 'bg-primary/10 text-foreground'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className={`w-10 h-10 rounded-full ${getInitialColor(guest.name)} flex items-center justify-center text-white font-semibold text-xs opacity-50`}>
                          {guest.name.charAt(0).toUpperCase()}
                        </div>
                        {guest.isActive && (
                          <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-emerald-500 text-card stroke-[3]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-muted-foreground truncate block">{guest.name}</span>
                        <span className="text-[11px] text-muted-foreground/60">
                          {guest.room ? `Room ${guest.room.roomNumber}` : guest.phone}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </>
            )}

            {filteredGuests?.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No matches' : 'No guests'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
