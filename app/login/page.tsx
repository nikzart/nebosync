'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { staffLogin, guestLogin } from './actions'

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Staff login form
  const [staffEmail, setStaffEmail] = useState('')
  const [staffPassword, setStaffPassword] = useState('')

  // Guest login form
  const [guestPhone, setGuestPhone] = useState('')
  const [guestRoom, setGuestRoom] = useState('')

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await staffLogin(staffEmail, staffPassword)
      if (result?.error) {
        toast.error('Login failed', { description: result.error })
      } else if (result?.success) {
        toast.success('Login successful!')
        router.push(result.redirectTo)
      }
    })
  }

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await guestLogin(guestPhone, guestRoom)
      if (result?.error) {
        toast.error('Login failed', { description: result.error })
      } else if (result?.success) {
        toast.success('Welcome!')
        router.push(result.redirectTo)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">NeboSync</CardTitle>
          <CardDescription className="text-center">
            Seamless hotel-guest communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="guest" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="guest">Guest</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
            </TabsList>

            <TabsContent value="guest" className="space-y-4 pt-4">
              <form onSubmit={handleGuestLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="room" className="text-sm font-medium">
                    Room Number
                  </label>
                  <Input
                    id="room"
                    type="text"
                    placeholder="101"
                    value={guestRoom}
                    onChange={(e) => setGuestRoom(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-pastel-purple hover:bg-pastel-purple/90"
                  disabled={isPending}
                >
                  {isPending ? 'Logging in...' : 'Login as Guest'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="staff" className="space-y-4 pt-4">
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@hotel.com"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending ? 'Logging in...' : 'Login as Staff'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
