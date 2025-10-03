'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, User, Phone, Calendar, DoorOpen, MessageSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'

interface Guest {
  id: string
  name: string
  phone: string
  email: string | null
  room: {
    id: string
    roomNumber: string
    roomType: string
    floor: number
  } | null
  checkInDate: string | null
  checkOutDate: string | null
  _count: {
    orders: number
    messages: number
  }
}

export default function GuestsManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: guests, isLoading } = useQuery<Guest[]>({
    queryKey: ['all-guests'],
    queryFn: async () => {
      const res = await fetch('/api/guests')
      if (!res.ok) throw new Error('Failed to fetch guests')
      return res.json()
    },
  })

  const filteredGuests = guests?.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone.includes(searchQuery) ||
      guest.room?.roomNumber.includes(searchQuery) ||
      guest.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Guest Management</h1>
        <p className="text-muted-foreground">
          View and manage hotel guests
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search guests by name, phone, room, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Guests Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredGuests && filteredGuests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuests.map((guest, index) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Guest Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{guest.name}</h3>
                      {guest.room ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DoorOpen className="w-4 h-4" />
                          <span>Room {guest.room.roomNumber}</span>
                          <span className="text-xs">({guest.room.roomType})</span>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No room assigned</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{guest.phone}</span>
                    </div>
                    {guest.email && (
                      <div className="flex items-center gap-2 text-sm truncate">
                        <span className="text-muted-foreground">✉</span>
                        <span className="truncate">{guest.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Stay Dates */}
                  {guest.checkInDate && guest.checkOutDate && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Stay Period</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(guest.checkInDate), 'MMM dd')} -{' '}
                        {format(new Date(guest.checkOutDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {guest._count.orders}
                      </p>
                      <p className="text-xs text-muted-foreground">Orders</p>
                    </div>
                    <div className="flex-1 p-2 bg-green-50 dark:bg-green-950/20 rounded text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {guest._count.messages}
                      </p>
                      <p className="text-xs text-muted-foreground">Messages</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/staff/messages/${guest.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Chat
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No guests found</h2>
            <p className="text-muted-foreground">
              {searchQuery ? 'No guests match your search' : 'No guests checked in yet'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
