'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  ShoppingCart,
  MessageSquare,
  Settings,
  UtensilsCrossed,
  Briefcase,
  Users,
  BedDouble,
  FileText,
  UserCog,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/staff', icon: LayoutDashboard },
  { name: 'Orders', href: '/staff/orders', icon: ShoppingCart },
  { name: 'Messages', href: '/staff/messages', icon: MessageSquare },
  { name: 'Food Menu', href: '/staff/food-menu', icon: UtensilsCrossed },
  { name: 'Services', href: '/staff/services', icon: Briefcase },
  { name: 'Guests', href: '/staff/guests', icon: Users },
  { name: 'Rooms', href: '/staff/rooms', icon: BedDouble },
  { name: 'Invoices', href: '/staff/invoices', icon: FileText },
  { name: 'Staff', href: '/staff/staff-management', icon: UserCog, adminOnly: true },
  { name: 'Settings', href: '/staff/settings', icon: Settings },
]

export function StaffSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  // Filter navigation based on user role
  const visibleNavigation = navigation.filter((item) => {
    if (item.adminOnly && session?.user?.role !== 'ADMIN') {
      return false
    }
    return true
  })

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await signOut({ redirect: false })
        toast.success('Logged out successfully')
        router.push('/login')
      } catch (error) {
        toast.error('Failed to logout')
      }
    }
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-card border-r border-border flex flex-col items-center py-6 z-50">
      {/* Logo */}
      <Link href="/staff" className="mb-8">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl">N</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {visibleNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
              )}
              title={item.name}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          )
        })}
      </nav>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-12 h-12 rounded-2xl bg-secondary text-muted-foreground hover:bg-destructive/20 hover:text-destructive flex items-center justify-center transition-colors"
        title="Logout"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </aside>
  )
}
