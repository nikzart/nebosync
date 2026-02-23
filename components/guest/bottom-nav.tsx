'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Home, ConciergeBell, MessageCircle, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/guest', icon: Home },
  { name: 'Services', href: '/guest/services', icon: ConciergeBell },
  { name: 'Chat', href: '/guest/chat', icon: MessageCircle },
  { name: 'Profile', href: '/guest/profile', icon: User },
]

const pillSpring = { type: 'spring', stiffness: 350, damping: 30 } as const
const labelSpring = { type: 'spring', stiffness: 300, damping: 28 } as const

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
    <nav className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
         style={{ willChange: 'transform' }}>
      <div className="bg-white/90 backdrop-blur-xl rounded-[20px] border border-[#EDECEA] px-2 py-2 flex items-center"
           style={{ boxShadow: 'var(--shadow-floating)', transform: 'translate3d(0,0,0)' }}>
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href === '/guest/services' && pathname?.startsWith('/guest/services')) ||
            (item.href === '/guest/services' && pathname?.startsWith('/guest/food')) ||
            (item.href === '/guest/services' && pathname?.startsWith('/guest/cart')) ||
            (item.href === '/guest/services' && pathname?.startsWith('/guest/checkout'))
          const isChatIcon = item.name === 'Chat'
          const showBadge = isChatIcon && !isActive && typeof unreadCount === 'number' && unreadCount > 0

          return (
            <Link key={item.name} href={item.href} className="relative flex-1 flex justify-center">
              {/* Sliding pill background */}
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-[#2D5A3D] rounded-[14px]"
                  transition={pillSpring}
                  style={{ willChange: 'transform' }}
                />
              )}

              {/* Content — always on top of pill */}
              <div className="relative z-10 flex items-center px-4 py-2.5">
                <item.icon className={cn(
                  'w-5 h-5 shrink-0 transition-colors duration-200',
                  isActive ? 'text-white' : 'text-[#A1A1A1]'
                )} />
                <motion.span
                  initial={false}
                  animate={{
                    width: isActive ? 'auto' : 0,
                    marginLeft: isActive ? 8 : 0,
                    opacity: isActive ? 1 : 0,
                  }}
                  transition={labelSpring}
                  className="text-[13px] font-semibold text-white overflow-hidden whitespace-nowrap"
                >
                  {item.name}
                </motion.span>
              </div>

              {showBadge && (
                <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#B5403A] rounded-full flex items-center justify-center px-1 z-20">
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
