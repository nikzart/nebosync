'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, BedDouble, ShoppingCart, FileText, AlertTriangle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface GuestForCheckout {
  id: string
  name: string
  phone: string
  room: {
    roomNumber: string
    roomType: string
    block: { id: string; name: string } | null
    floor: number
  } | null
  checkInDate: string
}

interface GuestDetails {
  id: string
  name: string
  totalSpent: number
  pendingOrders: number
  unpaidInvoices: number
  _count: {
    orders: number
    messages: number
    invoices: number
  }
}

interface CheckOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest: GuestForCheckout | null
}

export function CheckOutDialog({ open, onOpenChange, guest }: CheckOutDialogProps) {
  const queryClient = useQueryClient()

  const { data: guestDetails } = useQuery<GuestDetails>({
    queryKey: ['guest-details', guest?.id],
    queryFn: async () => {
      const res = await fetch(`/api/guests/${guest!.id}`)
      if (!res.ok) throw new Error('Failed to fetch guest details')
      return res.json()
    },
    enabled: open && !!guest,
  })

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/guests/${guest!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkout' }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to check out guest')
      }
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['all-guests'] })
      queryClient.invalidateQueries({ queryKey: ['all-rooms'] })
      queryClient.invalidateQueries({ queryKey: ['available-rooms'] })
      queryClient.invalidateQueries({ queryKey: ['header-quick-stats'] })
      const summary = data.summary
      toast.success(
        `${guest!.name} checked out. Stay: ${summary.stayDuration} day(s), Total: ₹${summary.totalSpent.toLocaleString('en-IN')}`
      )
      onOpenChange(false)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  if (!guest) return null

  const stayDays = Math.ceil(
    (new Date().getTime() - new Date(guest.checkInDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  const hasWarnings = (guestDetails?.pendingOrders || 0) > 0 || (guestDetails?.unpaidInvoices || 0) > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Check Out Guest</DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* Stay Summary */}
          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Stay Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-sm">
              <span className="text-muted-foreground">Guest</span>
              <span className="font-medium">{guest.name}</span>
              {guest.room && (
                <>
                  <span className="text-muted-foreground">Room</span>
                  <span className="font-medium">
                    {guest.room.roomNumber} ({guest.room.roomType})
                  </span>
                </>
              )}
              <span className="text-muted-foreground">Check-in</span>
              <span className="font-medium">{format(new Date(guest.checkInDate), 'MMM dd, yyyy')}</span>
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{stayDays} night{stayDays !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Activity Summary */}
          {guestDetails && (
            <div className="p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Activity Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-medium">{guestDetails._count.orders}</span>
                <span className="text-muted-foreground">Total Spent</span>
                <span className="font-medium">₹{guestDetails.totalSpent.toLocaleString('en-IN')}</span>
                <span className="text-muted-foreground">Pending Orders</span>
                <span className={`font-medium ${guestDetails.pendingOrders > 0 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                  {guestDetails.pendingOrders}
                </span>
                <span className="text-muted-foreground">Unpaid Invoices</span>
                <span className={`font-medium ${guestDetails.unpaidInvoices > 0 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                  {guestDetails.unpaidInvoices}
                </span>
              </div>
            </div>
          )}

          {/* Warnings */}
          {hasWarnings && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                {guestDetails!.pendingOrders > 0 && (
                  <p>Guest has {guestDetails!.pendingOrders} pending order{guestDetails!.pendingOrders > 1 ? 's' : ''}.</p>
                )}
                {guestDetails!.unpaidInvoices > 0 && (
                  <p>Guest has {guestDetails!.unpaidInvoices} unpaid invoice{guestDetails!.unpaidInvoices > 1 ? 's' : ''}.</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => checkOutMutation.mutate()}
              disabled={checkOutMutation.isPending}
              variant="destructive"
              className="flex-1 gap-1"
            >
              <LogOut className="w-4 h-4" />
              {checkOutMutation.isPending ? 'Checking out...' : 'Confirm Check-Out'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
