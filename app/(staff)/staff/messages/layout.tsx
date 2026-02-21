'use client'

import { usePathname } from 'next/navigation'
import { ConversationList } from '@/components/staff/conversation-list'

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isChatOpen = pathname !== '/staff/messages'

  // Cancel parent <main>'s p-6 with negative margins, then set a fixed height
  // that accounts for the 80px sticky staff header + the 24px top padding we just cancelled.
  // overflow-hidden prevents any child from escaping this box.
  return (
    <div className="-mx-6 -mb-6 -mt-6 h-[calc(100vh-5rem)] flex overflow-hidden bg-background">
      {/* Left pane — conversation list */}
      <div
        className={`w-80 shrink-0 border-r bg-card flex flex-col min-h-0 ${
          isChatOpen ? 'hidden lg:flex' : 'flex w-full lg:w-80'
        }`}
      >
        <ConversationList />
      </div>

      {/* Right pane — chat or placeholder */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-0 ${
          !isChatOpen ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
