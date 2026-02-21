'use client'

import { MessageSquare } from 'lucide-react'

export default function StaffMessagesPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/10">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <h2 className="text-base font-semibold text-foreground mb-1">Select a conversation</h2>
        <p className="text-sm text-muted-foreground">
          Choose a guest from the list to start chatting
        </p>
      </div>
    </div>
  )
}
