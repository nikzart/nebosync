'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/guest', icon: Home },
  { name: 'Services', href: '/guest/services', icon: ShoppingBag },
  { name: 'Chat', href: '/guest/chat', icon: MessageCircle },
  { name: 'Profile', href: '/guest/profile', icon: User },
]

export function GuestBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto px-6 h-20 flex items-center justify-around">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-1 transition-all"
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center transition-all',
                  isActive
                    ? 'bg-lime-accent scale-110'
                    : 'bg-transparent'
                )}
              >
                <item.icon
                  className={cn(
                    'w-6 h-6 transition-colors',
                    isActive ? 'text-black' : 'text-gray-400'
                  )}
                />
              </div>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-lime-accent" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
