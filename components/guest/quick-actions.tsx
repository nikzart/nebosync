'use client'

import Link from 'next/link'
import { UtensilsCrossed, ConciergeBell, MessageSquare, Wifi } from 'lucide-react'
import { motion } from 'framer-motion'

const actions = [
  { name: 'Food Menu', href: '/guest/food', icon: UtensilsCrossed, color: 'bg-purple-100' },
  { name: 'Services', href: '/guest/services', icon: ConciergeBell, color: 'bg-blue-100' },
  { name: 'Chat', href: '/guest/chat', icon: MessageSquare, color: 'bg-green-100' },
  { name: 'WiFi', href: '/guest/wifi', icon: Wifi, color: 'bg-orange-100' },
]

export function QuickActions() {
  return (
    <div className="px-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={action.href}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-16 h-16 rounded-2xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon className="w-7 h-7 text-gray-700" />
              </div>
              <span className="text-xs text-gray-600 text-center">{action.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
