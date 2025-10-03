'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { MessageSquare, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Guest {
  id: string
  name: string
  phone: string
  room: {
    roomNumber: string
  } | null
}

interface Message {
  id: string
  content: string
  isFromGuest: boolean
  createdAt: string
}

interface GuestWithLastMessage extends Guest {
  lastMessage?: Message
  unreadCount: number
}

export default function StaffMessagesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: guests, isLoading } = useQuery<GuestWithLastMessage[]>({
    queryKey: ['staff-messages'],
    queryFn: async () => {
      const res = await fetch('/api/guests')
      if (!res.ok) throw new Error('Failed to fetch guests')
      const guestsData = await res.json()

      // For each guest, fetch their last message
      const guestsWithMessages = await Promise.all(
        guestsData.map(async (guest: Guest) => {
          try {
            const messagesRes = await fetch(`/api/messages?guestId=${guest.id}`)
            const messages = await messagesRes.json()
            const lastMessage = messages[messages.length - 1]
            const unreadCount = messages.filter(
              (m: Message) => !m.isFromGuest && m.isFromGuest
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

      return guestsWithMessages
    },
    refetchInterval: 10000,
  })

  const filteredGuests = guests?.filter((guest) =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.room?.roomNumber.includes(searchQuery)
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Chat with guests and respond to their requests
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Guest List */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredGuests && filteredGuests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredGuests.map((guest, index) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link href={`/staff/messages/${guest.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{guest.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {guest.room
                              ? `Room ${guest.room.roomNumber}`
                              : guest.phone}
                          </p>
                        </div>
                      </div>
                      {guest.unreadCount > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                          {guest.unreadCount}
                        </span>
                      )}
                    </div>
                    {guest.lastMessage && (
                      <div className="text-sm text-muted-foreground truncate">
                        <span className="font-medium">
                          {guest.lastMessage.isFromGuest ? 'Guest' : 'You'}:
                        </span>{' '}
                        {guest.lastMessage.content}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No conversations</h2>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No guests match your search'
                : 'Start chatting with guests'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
