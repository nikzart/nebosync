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
    <header className="sticky top-0 z-50 h-20 border-b border-border bg-card px-6 flex items-center justify-between">
      {/* Navigation Pills */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="rounded-full bg-secondary hover:bg-secondary/80 text-foreground px-6"
        >
          Check Box
        </Button>
        <Button
          variant="ghost"
          className="rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground px-6"
        >
          Monitoring
        </Button>
        <Button
          variant="ghost"
          className="rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground px-6"
        >
          Support
        </Button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground w-64 rounded-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-orange-500 hover:bg-orange-500 text-[10px] text-white">
            3
          </Badge>
        </button>

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
