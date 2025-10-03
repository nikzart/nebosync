'use client'

import { Search, Bell } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface StaffHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

export function StaffHeader({ user }: StaffHeaderProps) {
  return (
    <header className="h-20 border-b border-[#2a2a2a] bg-[#0a0a0a] px-6 flex items-center justify-between">
      {/* Navigation Pills */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white px-6"
        >
          Check Box
        </Button>
        <Button
          variant="ghost"
          className="rounded-full hover:bg-[#2a2a2a] text-gray-400 hover:text-white px-6"
        >
          Monitoring
        </Button>
        <Button
          variant="ghost"
          className="rounded-full hover:bg-[#2a2a2a] text-gray-400 hover:text-white px-6"
        >
          Support
        </Button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-500 w-64 rounded-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] flex items-center justify-center transition-colors">
          <Bell className="w-5 h-5 text-gray-400" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-[#ff8844] hover:bg-[#ff8844] text-[10px]">
            3
          </Badge>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user.name || 'Staff'}</p>
            <p className="text-xs text-gray-400">@{user.role?.toLowerCase() || 'staff'}</p>
          </div>
          <Avatar className="w-10 h-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-[#a3ff57] text-black">
              {user.name?.charAt(0) || 'S'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
