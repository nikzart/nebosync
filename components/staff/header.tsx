'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search, Bell, Clock, MessageSquare, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StaffHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

interface QuickStats {
  pendingOrders: number
  unreadMessages: number
  activeGuests: number
}

export function StaffHeader({ user }: StaffHeaderProps) {
  const pathname = usePathname()

  const { data: stats } = useQuery<QuickStats>({
    queryKey: ['header-quick-stats'],
    queryFn: async () => {
      const [ordersRes, messagesRes, guestsRes] = await Promise.all([
        fetch('/api/orders?status=PENDING'),
        fetch('/api/messages?unread=true'),
        fetch('/api/guests?active=true'),
      ])

      const orders = await ordersRes.json()
      const messages = await messagesRes.json()
      const guests = await guestsRes.json()

      return {
        pendingOrders: orders.length,
        unreadMessages: messages.length,
        activeGuests: guests.length,
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds for near-real-time updates
    refetchOnFocus: true, // Refetch when tab gains focus
    refetchOnReconnect: true, // Refetch on network reconnect
  })

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-border bg-card px-6 flex items-center justify-between">
      {/* Quick Stats Pills */}
      <div className="flex items-center gap-3">
        <Link href="/staff/orders?status=PENDING">
          <Button
            variant="ghost"
            className={cn(
              'rounded-full hover:bg-secondary px-6 gap-2',
              pathname === '/staff/orders'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Clock className="w-4 h-4" />
            <span>Pending Orders</span>
            {stats && stats.pendingOrders > 0 && (
              <Badge className="ml-1 bg-orange-500 hover:bg-orange-500 text-white h-5 min-w-5 flex items-center justify-center">
                {stats.pendingOrders}
              </Badge>
            )}
          </Button>
        </Link>
        <Link href="/staff/messages">
          <Button
            variant="ghost"
            className={cn(
              'rounded-full hover:bg-secondary px-6 gap-2',
              pathname === '/staff/messages'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages</span>
            {stats && stats.unreadMessages > 0 && (
              <Badge className="ml-1 bg-blue-500 hover:bg-blue-500 text-white h-5 min-w-5 flex items-center justify-center">
                {stats.unreadMessages}
              </Badge>
            )}
          </Button>
        </Link>
        <Link href="/staff/guests">
          <Button
            variant="ghost"
            className={cn(
              'rounded-full hover:bg-secondary px-6 gap-2',
              pathname === '/staff/guests'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Users className="w-4 h-4" />
            <span>Active Guests</span>
            {stats && stats.activeGuests > 0 && (
              <Badge className="ml-1 bg-green-500 hover:bg-green-500 text-white h-5 min-w-5 flex items-center justify-center">
                {stats.activeGuests}
              </Badge>
            )}
          </Button>
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground w-64 rounded-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-orange-500 hover:bg-orange-500 text-[10px] text-white">
            3
          </Badge>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user.name || 'Staff'}</p>
            <p className="text-xs text-muted-foreground">@{user.role?.toLowerCase() || 'staff'}</p>
          </div>
          <Avatar className="w-10 h-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name?.charAt(0) || 'S'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
