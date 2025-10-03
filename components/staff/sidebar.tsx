'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  MessageSquare,
  Settings,
  Heart,
  Calendar,
  Diamond,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/staff', icon: LayoutDashboard },
  { name: 'Orders', href: '/staff/orders', icon: ShoppingCart },
  { name: 'Messages', href: '/staff/messages', icon: MessageSquare },
  { name: 'Calendar', href: '/staff/calendar', icon: Calendar },
  { name: 'Premium', href: '/staff/premium', icon: Diamond },
  { name: 'Settings', href: '/staff/settings', icon: Settings },
]

export function StaffSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-[#0a0a0a] border-r border-[#2a2a2a] flex flex-col items-center py-6 z-50">
      {/* Logo */}
      <Link href="/staff" className="mb-8">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
          <span className="text-black font-bold text-xl">N</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center transition-colors',
                isActive
                  ? 'bg-[#a3ff57] text-black'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
              )}
              title={item.name}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          )
        })}
      </nav>

      {/* Add button */}
      <button className="w-12 h-12 rounded-2xl bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a] hover:text-white flex items-center justify-center transition-colors">
        <Plus className="w-5 h-5" />
      </button>
    </aside>
  )
}
