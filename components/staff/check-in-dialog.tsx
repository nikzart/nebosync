'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BedDouble, ArrowLeft, ArrowRight, Check, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface AvailableRoom {
  id: string
  roomNumber: string
  roomType: string
  floor: number
  blockId: string | null
  block: { id: string; name: string; description: string | null } | null
  pricePerNight: number
  status: string
}

interface CheckInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckInDialog({ open, onOpenChange }: CheckInDialogProps) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null)
  const [roomSearch, setRoomSearch] = useState('')
  const [roomBlockFilter, setRoomBlockFilter] = useState('all')
  const [roomTypeFilter, setRoomTypeFilter] = useState('all')
  const [guestForm, setGuestForm] = useState({
    name: '',
    phone: '',
    email: '',
    checkOutDate: '',
  })

  const { data: availableRooms } = useQuery<AvailableRoom[]>({
    queryKey: ['available-rooms'],
    queryFn: async () => {
      const res = await fetch('/api/rooms?status=AVAILABLE')
      if (!res.ok) throw new Error('Failed to fetch rooms')
      return res.json()
    },
    enabled: open,
  })

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/guests/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guestForm.name,
          phone: guestForm.phone,
          email: guestForm.email || undefined,
          roomId: selectedRoom!.id,
          checkOutDate: guestForm.checkOutDate || undefined,
        }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to check in guest')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-guests'] })
      queryClient.invalidateQueries({ queryKey: ['all-rooms'] })
      queryClient.invalidateQueries({ queryKey: ['available-rooms'] })
      queryClient.invalidateQueries({ queryKey: ['header-quick-stats'] })
      toast.success('Guest checked in successfully')
      handleClose()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const handleClose = () => {
    setStep(1)
    setSelectedRoom(null)
    setRoomSearch('')
    setRoomBlockFilter('all')
    setRoomTypeFilter('all')
    setGuestForm({ name: '', phone: '', email: '', checkOutDate: '' })
    onOpenChange(false)
  }

  const blockList = availableRooms?.reduce((acc, r) => {
    if (r.block && !acc.find((b) => b.id === r.block!.id)) acc.push(r.block)
    return acc
  }, [] as { id: string; name: string; description: string | null }[]).sort((a, b) => a.name.localeCompare(b.name)) || []
  const types = [...new Set(availableRooms?.map((r) => r.roomType) || [])].sort()

  const filteredRooms = availableRooms?.filter((room) => {
    if (roomBlockFilter !== 'all' && room.block?.id !== roomBlockFilter) return false
    if (roomTypeFilter !== 'all' && room.roomType !== roomTypeFilter) return false
    if (roomSearch && !room.roomNumber.toLowerCase().includes(roomSearch.toLowerCase())) return false
    return true
  })

  const canProceedStep1 = !!selectedRoom
  const canProceedStep2 = guestForm.name.trim() && guestForm.phone.trim()

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Check In Guest — Step {step} of 3
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Select Room */}
        {step === 1 && (
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-4">Select an available room</p>

            {/* Room Filters */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Room #"
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <Select value={roomBlockFilter} onValueChange={setRoomBlockFilter}>
                <SelectTrigger className="w-[100px] h-9 text-sm">
                  <SelectValue placeholder="Block" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {blockList.map((b) => (
                    <SelectItem key={b.id} value={b.id}>Block {b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
                <SelectTrigger className="w-[110px] h-9 text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Room List */}
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {filteredRooms && filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedRoom?.id === room.id
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Room {room.roomNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {room.roomType} {room.block && <>&middot; Block {room.block.name}</>} &middot; Floor {room.floor}
                        </p>
                      </div>
                      <p className="font-semibold text-primary">
                        ₹{room.pricePerNight.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-muted-foreground"> /night</span>
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center">
                  <BedDouble className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No available rooms</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="flex-1 gap-1"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Guest Details */}
        {step === 2 && (
          <div className="py-2">
            {/* Selected Room Summary */}
            {selectedRoom && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">Room {selectedRoom.roomNumber}</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedRoom.roomType} {selectedRoom.block && <>&middot; Block {selectedRoom.block.name}</>}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    ₹{selectedRoom.pricePerNight.toLocaleString('en-IN')}/night
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Guest Name *</label>
                <Input
                  value={guestForm.name}
                  onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number *</label>
                <Input
                  type="tel"
                  value={guestForm.phone}
                  onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={guestForm.email}
                  onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                  placeholder="guest@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Expected Check-out Date</label>
                <Input
                  type="date"
                  value={guestForm.checkOutDate}
                  onChange={(e) => setGuestForm({ ...guestForm, checkOutDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 gap-1"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-4">Review the details and confirm check-in</p>

            {/* Room Summary */}
            {selectedRoom && (
              <div className="p-4 bg-muted/50 rounded-xl mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <BedDouble className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Room Details</span>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-sm">
                  <span className="text-muted-foreground">Room</span>
                  <span className="font-medium">{selectedRoom.roomNumber}</span>
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{selectedRoom.roomType}</span>
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{selectedRoom.block ? `Block ${selectedRoom.block.name}, ` : ''}Floor {selectedRoom.floor}</span>
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">₹{selectedRoom.pricePerNight.toLocaleString('en-IN')} / night</span>
                </div>
              </div>
            )}

            {/* Guest Summary */}
            <div className="p-4 bg-muted/50 rounded-xl mb-3">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Guest Details</span>
              </div>
              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{guestForm.name}</span>
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{guestForm.phone}</span>
                {guestForm.email && (
                  <>
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{guestForm.email}</span>
                  </>
                )}
                {guestForm.checkOutDate && (
                  <>
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium">{new Date(guestForm.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                onClick={() => checkInMutation.mutate()}
                disabled={checkInMutation.isPending}
                className="flex-1 gap-1"
              >
                <Check className="w-4 h-4" />
                {checkInMutation.isPending ? 'Checking in...' : 'Confirm Check-In'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
