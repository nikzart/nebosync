'use client'

import Link from 'next/link'
import { UtensilsCrossed, ConciergeBell, MessageCircle, Wifi } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem, tapScale } from '@/lib/motion'

const actions = [
  { name: 'Order Food', desc: 'Browse menu', href: '/guest/food', icon: UtensilsCrossed },
  { name: 'Services', desc: 'Room service & more', href: '/guest/services', icon: ConciergeBell },
  { name: 'Chat', desc: 'Talk to staff', href: '/guest/chat', icon: MessageCircle },
  { name: 'WiFi', desc: 'Connect to network', href: '/guest/wifi', icon: Wifi },
]

export function QuickActions() {
  return (
    <div className="px-5 mb-6">
      <h3 className="text-[18px] font-semibold text-[#1C1C1C] tracking-tight mb-3">
        Quick Actions
      </h3>
      <motion.div
        className="grid grid-cols-2 gap-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {actions.map((action) => (
          <motion.div key={action.name} variants={staggerItem}>
            <Link href={action.href}>
              <motion.div
                {...tapScale}
                className="bg-white rounded-[12px] p-4"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="w-10 h-10 rounded-[8px] bg-[#EBF3ED] flex items-center justify-center mb-3">
                  <action.icon className="w-5 h-5 text-[#2D5A3D]" />
                </div>
                <p className="text-[15px] font-semibold text-[#1C1C1C]">{action.name}</p>
                <p className="text-[12px] text-[#A1A1A1] mt-0.5">{action.desc}</p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
