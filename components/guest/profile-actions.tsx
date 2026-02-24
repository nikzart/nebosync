'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, MessageCircle, ConciergeBell, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { tapScale } from '@/lib/motion'

export function ProfileActions() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      setIsLoggingOut(true)
      try {
        await signOut({ redirect: false })
        toast.success('Logged out successfully')
        router.push('/guest-login')
      } catch {
        toast.error('Failed to logout')
        setIsLoggingOut(false)
      }
    }
  }

  const actions = [
    { label: 'View Orders', icon: ShoppingBag, href: '/guest/orders' },
    { label: 'Chat with Staff', icon: MessageCircle, href: '/guest/chat' },
    { label: 'Browse Services', icon: ConciergeBell, href: '/guest/services' },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[12px] p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-3">Quick Actions</h2>
        <div className="space-y-2">
          {actions.map((action) => (
            <motion.button
              key={action.label}
              {...tapScale}
              onClick={() => router.push(action.href)}
              className="w-full flex items-center gap-3 h-11 px-3 rounded-[8px] border border-[#EDECEA] text-[14px] font-medium text-[#1C1C1C]"
            >
              <action.icon className="w-4 h-4 text-[#2D5A3D]" />
              {action.label}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[12px] p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
        <motion.button
          {...tapScale}
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-[8px] bg-[#FDF1F0] text-[#B5403A] text-[14px] font-semibold disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </motion.button>
      </div>
    </div>
  )
}
