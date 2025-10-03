'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ShoppingBag, FileText, MessageCircle, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'

export function ProfileActions() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      setIsLoggingOut(true)
      try {
        await signOut({ callbackUrl: '/login', redirect: true })
        toast.success('Logged out successfully')
      } catch (error) {
        toast.error('Failed to logout')
        setIsLoggingOut(false)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => router.push('/guest/orders')}
          >
            <ShoppingBag className="w-5 h-5 text-pastel-purple" />
            <span>View All Orders</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => router.push('/guest/chat')}
          >
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <span>Chat with Staff</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => router.push('/guest')}
          >
            <FileText className="w-5 h-5 text-orange-600" />
            <span>View Services</span>
          </Button>
        </div>
      </div>

      {/* Logout Button */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <Button
          variant="destructive"
          className="w-full gap-3 h-12"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="w-5 h-5" />
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </Button>
      </div>
    </div>
  )
}
