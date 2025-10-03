'use client'

import { Bell } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface GuestHeaderProps {
  guestName: string
}

export function GuestHeader({ guestName }: GuestHeaderProps) {
  return (
    <header className="px-6 pt-12 pb-6">
      <div className="flex items-center justify-between mb-8">
        <Avatar className="w-12 h-12">
          <AvatarImage src="" />
          <AvatarFallback className="bg-pastel-purple text-white">
            {guestName?.charAt(0) || 'G'}
          </AvatarFallback>
        </Avatar>
        <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>

      <div>
        <h1 className="text-4xl font-semibold text-gray-900 mb-2">
          Hello
        </h1>
        <h2 className="text-4xl font-semibold text-gray-900">
          {guestName?.split(' ')[0] || 'Guest'}!
        </h2>
      </div>
    </header>
  )
}
