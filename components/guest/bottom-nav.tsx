'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Home, ConciergeBell, MessageCircle, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { navSpring } from '@/lib/motion'

const navigation = [
  { name: 'Home', href: '/guest', icon: Home },
  { name: 'Services', href: '/guest/services', icon: ConciergeBell },
  { name: 'Chat', href: '/guest/chat', icon: MessageCircle },
  { name: 'Profile', href: '/guest/profile', icon: User },
]

export function GuestBottomNav() {
  const pathname = usePathname()

  const { data: unreadCount } = useQuery<number>({
    queryKey: ['guest-unread-messages'],
    queryFn: async () => {
      const res = await fetch('/api/messages?unread=true')
      if (!res.ok) return 0
      const messages = await res.json()
      return messages.length
    },
    refetchInterval: 5000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-white/90 backdrop-blur-xl rounded-[20px] border border-[#EDECEA] px-2 py-2 flex items-center justify-around"
           style={{ boxShadow: 'var(--shadow-floating)' }}>
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href === '/guest/services' && pathname?.startsWith('/guest/services')) ||
            (item.href === '/guest/services' && pathname?.startsWith('/guest/food')) ||
            (item.href === '/guest/services' && pathname?.startsWith('/guest/cart')) ||
            (item.href === '/guest/services' && pathname?.startsWith('/guest/checkout'))
          const isChatIcon = item.name === 'Chat'
          const showBadge = isChatIcon && !isActive && typeof unreadCount === 'number' && unreadCount > 0

          return (
            <Link key={item.name} href={item.href} className="relative">
              <motion.div
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-[14px] transition-colors',
                  isActive && 'bg-[#2D5A3D]'
                )}
                layout
                transition={navSpring}
              >
                <item.icon className={cn(
                  'w-5 h-5 shrink-0',
                  isActive ? 'text-white' : 'text-[#A1A1A1]'
                )} />
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={navSpring}
                      className="text-[13px] font-semibold text-white overflow-hidden whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              {showBadge && (
                <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#B5403A] rounded-full flex items-center justify-center px-1">
                  <span className="text-[10px] font-bold text-white">
                    {unreadCount! > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
