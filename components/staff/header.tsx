'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search, Bell, Clock, MessageSquare, Users, User, ShoppingCart, UtensilsCrossed, Briefcase, Loader2 } from 'lucide-react'
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

interface SearchResult {
  guests: Array<{
    id: string
    name: string
    phone: string
    room: { roomNumber: string } | null
  }>
  orders: Array<{
    id: string
    status: string
    totalAmount: number
    guest: {
      name: string
      room: { roomNumber: string } | null
    }
  }>
  items: Array<{
    id: string
    name: string
    type: 'food' | 'service'
    price: number
  }>
}

export function StaffHeader({ user }: StaffHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

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
    refetchInterval: 5000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

  const { data: searchResults, isLoading: searchLoading } = useQuery<SearchResult>({
    queryKey: ['header-search', debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      if (!res.ok) throw new Error('Search failed')
      return res.json()
    },
    enabled: debouncedQuery.length >= 2,
  })

  const hasResults = searchResults && (
    searchResults.guests.length > 0 ||
    searchResults.orders.length > 0 ||
    searchResults.items.length > 0
  )

  function handleResultClick(href: string) {
    setIsSearchOpen(false)
    setSearchQuery('')
    router.push(href)
  }

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
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search guests, orders, items..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsSearchOpen(true)
            }}
            onFocus={() => {
              if (searchQuery.length >= 2) setIsSearchOpen(true)
            }}
            className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground w-64 rounded-full"
          />

          {/* Search Dropdown */}
          {isSearchOpen && debouncedQuery.length >= 2 && (
            <div className="absolute top-full mt-2 right-0 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
              {searchLoading ? (
                <div className="flex items-center justify-center p-6 gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </div>
              ) : !hasResults ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No results for &ldquo;{debouncedQuery}&rdquo;
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {/* Guests */}
                  {searchResults.guests.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                        Guests
                      </div>
                      {searchResults.guests.map((guest) => (
                        <button
                          key={guest.id}
                          onClick={() => handleResultClick(`/staff/guests`)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                        >
                          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{guest.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {guest.room ? `Room ${guest.room.roomNumber}` : guest.phone}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Orders */}
                  {searchResults.orders.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                        Orders
                      </div>
                      {searchResults.orders.map((order) => (
                        <button
                          key={order.id}
                          onClick={() => handleResultClick(`/staff/orders`)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                        >
                          <ShoppingCart className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {order.guest.room ? `Room ${order.guest.room.roomNumber}` : order.guest.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ₹{order.totalAmount.toLocaleString('en-IN')} &middot; {order.status}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Items */}
                  {searchResults.items.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                        Items
                      </div>
                      {searchResults.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() =>
                            handleResultClick(
                              item.type === 'food' ? '/staff/food-menu' : '/staff/services'
                            )
                          }
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                        >
                          {item.type === 'food' ? (
                            <UtensilsCrossed className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ₹{item.price.toLocaleString('en-IN')} &middot; {item.type === 'food' ? 'Food' : 'Service'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <Link
          href="/staff/orders?status=PENDING"
          className="relative w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {stats && stats.pendingOrders > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-orange-500 hover:bg-orange-500 text-[10px] text-white">
              {stats.pendingOrders > 9 ? '9+' : stats.pendingOrders}
            </Badge>
          )}
        </Link>

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
