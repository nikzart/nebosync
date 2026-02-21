'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  Search, User, Phone, Calendar, DoorOpen, MessageSquare,
  UserPlus, Edit, Trash2, LogOut,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { CheckInDialog } from '@/components/staff/check-in-dialog'
import { CheckOutDialog } from '@/components/staff/check-out-dialog'

interface Guest {
  id: string
  name: string
  phone: string
  email: string | null
  isActive: boolean
  room: {
    id: string
    roomNumber: string
    roomType: string
    floor: number
    block: { id: string; name: string } | null
  } | null
  checkInDate: string
  checkOutDate: string | null
  _count: {
    orders: number
    messages: number
  }
}

export default function GuestsManagementPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('active')
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [checkOutGuest, setCheckOutGuest] = useState<Guest | null>(null)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    checkOutDate: '',
  })

  const activeParam = activeTab === 'active' ? 'true' : activeTab === 'checked-out' ? 'false' : undefined

  const { data: guests, isLoading } = useQuery<Guest[]>({
    queryKey: ['all-guests', activeParam],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (activeParam) params.set('active', activeParam)
      const res = await fetch(`/api/guests?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch guests')
      return res.json()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: typeof editForm) => {
      const res = await fetch(`/api/guests/${editingGuest!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update guest')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-guests'] })
      toast.success('Guest updated successfully')
      handleCloseEdit()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete guest')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-guests'] })
      queryClient.invalidateQueries({ queryKey: ['all-rooms'] })
      queryClient.invalidateQueries({ queryKey: ['header-quick-stats'] })
      toast.success('Guest deleted successfully')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const filteredGuests = guests?.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone.includes(searchQuery) ||
      guest.room?.roomNumber.includes(searchQuery) ||
      guest.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest)
    setEditForm({
      name: guest.name,
      phone: guest.phone,
      email: guest.email || '',
      checkOutDate: guest.checkOutDate ? guest.checkOutDate.split('T')[0] : '',
    })
    setIsEditOpen(true)
  }

  const handleCloseEdit = () => {
    setIsEditOpen(false)
    setEditingGuest(null)
    setEditForm({ name: '', phone: '', email: '', checkOutDate: '' })
  }

  const handleEditSubmit = async () => {
    if (!editForm.name || !editForm.phone) {
      toast.error('Name and phone are required')
      return
    }
    await updateMutation.mutateAsync(editForm)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this guest? This will also delete all their orders, messages, and invoices.')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Guest Management</h1>
          <p className="text-muted-foreground">
            Manage guests, check-ins, and check-outs
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCheckInOpen(true)}>
          <UserPlus className="w-4 h-4" />
          Check In Guest
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="active">Active Guests</TabsTrigger>
          <TabsTrigger value="checked-out">Checked Out</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search guests by name, phone, room, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Guests Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredGuests && filteredGuests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuests.map((guest, index) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Guest Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg truncate">{guest.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          guest.isActive
                            ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                            : 'bg-red-500/20 text-red-700 dark:text-red-400'
                        }`}>
                          {guest.isActive ? 'Active' : 'Checked Out'}
                        </span>
                      </div>
                      {guest.room ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DoorOpen className="w-4 h-4" />
                          <span>Room {guest.room.roomNumber}</span>
                          <span className="text-xs">({guest.room.roomType})</span>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No room assigned</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{guest.phone}</span>
                    </div>
                    {guest.email && (
                      <div className="flex items-center gap-2 text-sm truncate">
                        <span className="text-muted-foreground">✉</span>
                        <span className="truncate">{guest.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Stay Dates */}
                  {guest.checkInDate && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Stay Period</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(guest.checkInDate), 'MMM dd, yyyy')}
                        {guest.checkOutDate ? (
                          <> — {format(new Date(guest.checkOutDate), 'MMM dd, yyyy')}</>
                        ) : (
                          <> — Present</>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {guest._count.orders}
                      </p>
                      <p className="text-xs text-muted-foreground">Orders</p>
                    </div>
                    <div className="flex-1 p-2 bg-green-50 dark:bg-green-950/20 rounded text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {guest._count.messages}
                      </p>
                      <p className="text-xs text-muted-foreground">Messages</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Link href={`/staff/messages/${guest.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1">
                          <MessageSquare className="w-4 h-4" />
                          Chat
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(guest)} className="flex-1 gap-1">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </div>
                    {guest.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCheckOutGuest(guest)}
                        className="w-full gap-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        <LogOut className="w-4 h-4" />
                        Check Out
                      </Button>
                    ) : (
                      session?.user?.role === 'ADMIN' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(guest.id)}
                          disabled={deleteMutation.isPending}
                          className="w-full gap-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No guests found</h2>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No guests match your search'
                : activeTab === 'active'
                ? 'No active guests. Click "Check In Guest" to get started.'
                : activeTab === 'checked-out'
                ? 'No checked-out guests yet'
                : 'No guests yet'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Check-In Dialog */}
      <CheckInDialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen} />

      {/* Check-Out Dialog */}
      <CheckOutDialog
        open={!!checkOutGuest}
        onOpenChange={(open) => { if (!open) setCheckOutGuest(null) }}
        guest={checkOutGuest}
      />

      {/* Edit Guest Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) handleCloseEdit() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Guest Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name *</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Phone *</label>
              <Input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="guest@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Expected Check-out Date</label>
              <Input
                type="date"
                value={editForm.checkOutDate}
                onChange={(e) => setEditForm({ ...editForm, checkOutDate: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCloseEdit} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
