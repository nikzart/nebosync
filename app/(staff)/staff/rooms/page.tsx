'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Plus, Edit, Trash2, Search, BedDouble, User,
  Wrench, SprayCan, CheckCircle, Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface RoomGuest {
  id: string
  name: string
  phone: string
  checkInDate: string
  checkOutDate: string | null
}

interface RoomBlock {
  id: string
  name: string
  description: string | null
}

interface Room {
  id: string
  roomNumber: string
  roomType: string
  floor: number
  blockId: string | null
  block: RoomBlock | null
  pricePerNight: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING'
  isOccupied: boolean
  guest: RoomGuest | null
}

interface Block {
  id: string
  name: string
  description: string | null
  totalFloors: number
  isActive: boolean
  _count: { rooms: number }
  statusCounts: {
    available: number
    occupied: number
    maintenance: number
    cleaning: number
  }
}

const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite', 'Premium']

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  AVAILABLE: { label: 'Available', color: 'bg-green-500/20 text-green-700 dark:text-green-400', icon: CheckCircle },
  OCCUPIED: { label: 'Occupied', color: 'bg-red-500/20 text-red-700 dark:text-red-400', icon: User },
  MAINTENANCE: { label: 'Maintenance', color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400', icon: Wrench },
  CLEANING: { label: 'Cleaning', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-400', icon: SprayCan },
}

export default function RoomsManagementPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [blockFilter, setBlockFilter] = useState('all')
  const [floorFilter, setFloorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    roomType: 'Standard',
    floor: '1',
    blockId: '',
    pricePerNight: '0',
  })

  // Block CRUD state
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)
  const [blockForm, setBlockForm] = useState({
    name: '',
    description: '',
    totalFloors: '1',
  })

  // Queries
  const { data: rooms, isLoading: roomsLoading } = useQuery<Room[]>({
    queryKey: ['all-rooms'],
    queryFn: async () => {
      const res = await fetch('/api/rooms')
      if (!res.ok) throw new Error('Failed to fetch rooms')
      return res.json()
    },
  })

  const { data: blocks, isLoading: blocksLoading } = useQuery<Block[]>({
    queryKey: ['all-blocks'],
    queryFn: async () => {
      const res = await fetch('/api/blocks')
      if (!res.ok) throw new Error('Failed to fetch blocks')
      return res.json()
    },
  })

  // Room mutations
  const createRoomMutation = useMutation({
    mutationFn: async (data: typeof roomForm) => {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create room')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-rooms'] })
      queryClient.invalidateQueries({ queryKey: ['all-blocks'] })
      toast.success('Room created successfully')
      handleCloseRoomDialog()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateRoomMutation = useMutation({
    mutationFn: async (data: typeof roomForm) => {
      const res = await fetch(`/api/rooms/${editingRoom?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update room')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-rooms'] })
      queryClient.invalidateQueries({ queryKey: ['all-blocks'] })
      toast.success('Room updated successfully')
      handleCloseRoomDialog()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/rooms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update status')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-rooms'] })
      queryClient.invalidateQueries({ queryKey: ['all-blocks'] })
      toast.success('Room status updated')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteRoomMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete room')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-rooms'] })
      queryClient.invalidateQueries({ queryKey: ['all-blocks'] })
      toast.success('Room deleted successfully')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // Block mutations
  const createBlockMutation = useMutation({
    mutationFn: async (data: typeof blockForm) => {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create block')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-blocks'] })
      toast.success('Block created successfully')
      handleCloseBlockDialog()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateBlockMutation = useMutation({
    mutationFn: async (data: typeof blockForm) => {
      const res = await fetch(`/api/blocks/${editingBlock?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update block')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-blocks'] })
      queryClient.invalidateQueries({ queryKey: ['all-rooms'] })
      toast.success('Block updated successfully')
      handleCloseBlockDialog()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteBlockMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/blocks/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete block')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-blocks'] })
      toast.success('Block deleted successfully')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const toggleBlockActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/blocks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update block')
      }
      return res.json()
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['all-blocks'] })
      toast.success(vars.isActive ? 'Block activated' : 'Block deactivated')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // Derived data
  const floors = [...new Set(rooms?.map((r) => r.floor) || [])].sort((a, b) => a - b)

  const filteredRooms = rooms?.filter((room) => {
    if (blockFilter !== 'all' && room.blockId !== blockFilter) return false
    if (floorFilter !== 'all' && room.floor !== parseInt(floorFilter)) return false
    if (statusFilter !== 'all' && room.status !== statusFilter) return false
    if (searchQuery && !room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Group rooms by block name then floor for block view
  const groupedRooms: Record<string, Record<number, Room[]>> = {}
  filteredRooms?.forEach((room) => {
    const blockName = room.block?.name || 'Unassigned'
    if (!groupedRooms[blockName]) groupedRooms[blockName] = {}
    if (!groupedRooms[blockName][room.floor]) groupedRooms[blockName][room.floor] = []
    groupedRooms[blockName][room.floor].push(room)
  })

  // Room dialog handlers
  const handleEditRoom = (room: Room) => {
    setEditingRoom(room)
    setRoomForm({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      floor: room.floor.toString(),
      blockId: room.blockId || '',
      pricePerNight: room.pricePerNight.toString(),
    })
    setIsRoomDialogOpen(true)
  }

  const handleCloseRoomDialog = () => {
    setIsRoomDialogOpen(false)
    setEditingRoom(null)
    setRoomForm({ roomNumber: '', roomType: 'Standard', floor: '1', blockId: blocks?.[0]?.id || '', pricePerNight: '0' })
  }

  const handleRoomSubmit = async () => {
    if (!roomForm.roomNumber || !roomForm.roomType) {
      toast.error('Please fill in all required fields')
      return
    }
    if (editingRoom) {
      await updateRoomMutation.mutateAsync(roomForm)
    } else {
      await createRoomMutation.mutateAsync(roomForm)
    }
  }

  const handleDeleteRoom = async (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      await deleteRoomMutation.mutateAsync(id)
    }
  }

  // Block dialog handlers
  const handleEditBlock = (block: Block) => {
    setEditingBlock(block)
    setBlockForm({
      name: block.name,
      description: block.description || '',
      totalFloors: block.totalFloors.toString(),
    })
    setIsBlockDialogOpen(true)
  }

  const handleCloseBlockDialog = () => {
    setIsBlockDialogOpen(false)
    setEditingBlock(null)
    setBlockForm({ name: '', description: '', totalFloors: '1' })
  }

  const handleBlockSubmit = async () => {
    if (!blockForm.name) {
      toast.error('Block name is required')
      return
    }
    if (editingBlock) {
      await updateBlockMutation.mutateAsync(blockForm)
    } else {
      await createBlockMutation.mutateAsync(blockForm)
    }
  }

  const handleDeleteBlock = async (id: string) => {
    if (confirm('Are you sure you want to delete this block? All rooms must be removed first.')) {
      await deleteBlockMutation.mutateAsync(id)
    }
  }

  // Stats
  const stats = {
    total: rooms?.length || 0,
    available: rooms?.filter((r) => r.status === 'AVAILABLE').length || 0,
    occupied: rooms?.filter((r) => r.status === 'OCCUPIED').length || 0,
    maintenance: rooms?.filter((r) => r.status === 'MAINTENANCE').length || 0,
    cleaning: rooms?.filter((r) => r.status === 'CLEANING').length || 0,
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Room Management</h1>
          <p className="text-muted-foreground">
            Manage hotel rooms, blocks, and availability
          </p>
        </div>
        <Button className="gap-2" onClick={() => { setRoomForm({ ...roomForm, blockId: blocks?.[0]?.id || '' }); setIsRoomDialogOpen(true) }}>
          <Plus className="w-4 h-4" />
          Add Room
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.available}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.occupied}</p>
            <p className="text-xs text-muted-foreground">Occupied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.maintenance}</p>
            <p className="text-xs text-muted-foreground">Maintenance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.cleaning}</p>
            <p className="text-xs text-muted-foreground">Cleaning</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by room number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={blockFilter} onValueChange={setBlockFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Block" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Blocks</SelectItem>
            {blocks?.map((b) => (
              <SelectItem key={b.id} value={b.id}>Block {b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={floorFilter} onValueChange={setFloorFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Floor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Floors</SelectItem>
            {floors.map((f) => (
              <SelectItem key={f} value={f.toString()}>Floor {f}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="OCCUPIED">Occupied</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="CLEANING">Cleaning</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View Tabs */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="block">Block View</TabsTrigger>
          <TabsTrigger value="blocks">Manage Blocks</TabsTrigger>
        </TabsList>

        {/* Grid View */}
        <TabsContent value="grid">
          {roomsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-5">
                    <div className="h-6 bg-muted rounded w-1/2 mb-3" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                    <div className="h-8 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredRooms && filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredRooms.map((room, index) => {
                const config = statusConfig[room.status]
                const StatusIcon = config.icon
                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold">Room {room.roomNumber}</h3>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${config.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {room.roomType} {room.block && <>&middot; Block {room.block.name}</>} &middot; Floor {room.floor}
                        </p>
                        <p className="text-lg font-semibold text-primary mb-3">
                          ₹{room.pricePerNight.toLocaleString('en-IN')} <span className="text-xs font-normal text-muted-foreground">/ night</span>
                        </p>
                        {room.guest && (
                          <div className="p-2.5 bg-muted/50 rounded-lg mb-3">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{room.guest.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">{room.guest.phone}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditRoom(room)} className="flex-1">
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                          {room.status !== 'OCCUPIED' && (
                            <Select value={room.status} onValueChange={(val) => statusMutation.mutate({ id: room.id, status: val })}>
                              <SelectTrigger className="h-8 text-xs w-[110px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AVAILABLE">Available</SelectItem>
                                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                <SelectItem value="CLEANING">Cleaning</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          {room.status !== 'OCCUPIED' && (
                            <Button size="sm" variant="outline" onClick={() => handleDeleteRoom(room.id)} disabled={deleteRoomMutation.isPending}>
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BedDouble className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No rooms found</h2>
                <p className="text-muted-foreground">
                  {searchQuery || blockFilter !== 'all' || floorFilter !== 'all' || statusFilter !== 'all'
                    ? 'No rooms match your filters'
                    : 'Add rooms to get started'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Block View */}
        <TabsContent value="block">
          {roomsLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-32 mb-4" />
                    <div className="flex gap-3">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="h-20 w-24 bg-muted rounded" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : Object.keys(groupedRooms).length > 0 ? (
            <div className="space-y-6">
              {Object.keys(groupedRooms).sort().map((blockName) => (
                <Card key={blockName}>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Block {blockName}</h2>
                    <div className="space-y-4">
                      {Object.keys(groupedRooms[blockName]).sort((a, b) => Number(a) - Number(b)).map((floor) => (
                        <div key={floor}>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Floor {floor}</p>
                          <div className="flex flex-wrap gap-2">
                            {groupedRooms[blockName][Number(floor)].map((room) => {
                              const config = statusConfig[room.status]
                              return (
                                <button
                                  key={room.id}
                                  onClick={() => handleEditRoom(room)}
                                  className={`relative p-3 rounded-xl border transition-all hover:scale-105 hover:shadow-md min-w-[100px] text-left ${
                                    room.status === 'OCCUPIED'
                                      ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                                      : room.status === 'AVAILABLE'
                                      ? 'border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                                      : room.status === 'MAINTENANCE'
                                      ? 'border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20'
                                      : 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20'
                                  }`}
                                >
                                  <p className="font-bold text-sm">{room.roomNumber}</p>
                                  <p className="text-xs text-muted-foreground">{room.roomType}</p>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1 inline-block ${config.color}`}>
                                    {config.label}
                                  </span>
                                  {room.guest && (
                                    <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[80px]">
                                      {room.guest.name}
                                    </p>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BedDouble className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No rooms found</h2>
                <p className="text-muted-foreground">Add rooms to see them organized by block</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Blocks Management Tab */}
        <TabsContent value="blocks">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">Create and manage hotel blocks/wings</p>
            <Button className="gap-2" onClick={() => setIsBlockDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Block
            </Button>
          </div>

          {blocksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-8 bg-muted rounded w-1/2 mb-3" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-16 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : blocks && blocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blocks.map((block, index) => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xl">Block {block.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              block.isActive
                                ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                : 'bg-red-500/20 text-red-700 dark:text-red-400'
                            }`}>
                              {block.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {block.description && (
                            <p className="text-sm text-muted-foreground">{block.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Block Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="p-2 bg-muted/50 rounded-lg text-center">
                          <p className="text-lg font-bold">{block._count.rooms}</p>
                          <p className="text-xs text-muted-foreground">Rooms</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded-lg text-center">
                          <p className="text-lg font-bold">{block.totalFloors}</p>
                          <p className="text-xs text-muted-foreground">Floors</p>
                        </div>
                      </div>

                      {/* Room Status Breakdown */}
                      {block._count.rooms > 0 && (
                        <div className="flex gap-1.5 mb-4">
                          {block.statusCounts.available > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-700 dark:text-green-400">
                              {block.statusCounts.available} avail
                            </span>
                          )}
                          {block.statusCounts.occupied > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-700 dark:text-red-400">
                              {block.statusCounts.occupied} occ
                            </span>
                          )}
                          {block.statusCounts.maintenance > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                              {block.statusCounts.maintenance} maint
                            </span>
                          )}
                          {block.statusCounts.cleaning > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400">
                              {block.statusCounts.cleaning} clean
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditBlock(block)} className="flex-1 gap-1">
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleBlockActiveMutation.mutate({ id: block.id, isActive: !block.isActive })}
                          className="flex-1"
                        >
                          {block.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        {block._count.rooms === 0 && (
                          <Button size="sm" variant="outline" onClick={() => handleDeleteBlock(block.id)} disabled={deleteBlockMutation.isPending}>
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </Button>
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
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No blocks yet</h2>
                <p className="text-muted-foreground">Create blocks to organize your rooms by wing or section</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Room Dialog */}
      <Dialog open={isRoomDialogOpen} onOpenChange={(open) => { if (!open) handleCloseRoomDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Room Number *</label>
              <Input
                value={roomForm.roomNumber}
                onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                placeholder="e.g., 101"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Room Type *</label>
              <Select value={roomForm.roomType} onValueChange={(val) => setRoomForm({ ...roomForm, roomType: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Floor *</label>
                <Input
                  type="number"
                  min="0"
                  value={roomForm.floor}
                  onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Block</label>
                <Select value={roomForm.blockId} onValueChange={(val) => setRoomForm({ ...roomForm, blockId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select block" />
                  </SelectTrigger>
                  <SelectContent>
                    {blocks?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>Block {b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Price Per Night (₹) *</label>
              <Input
                type="number"
                min="0"
                value={roomForm.pricePerNight}
                onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                placeholder="3500"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCloseRoomDialog} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleRoomSubmit}
                disabled={createRoomMutation.isPending || updateRoomMutation.isPending}
                className="flex-1"
              >
                {editingRoom ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Block Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={(open) => { if (!open) handleCloseBlockDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBlock ? 'Edit Block' : 'Add New Block'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Block Name *</label>
              <Input
                value={blockForm.name}
                onChange={(e) => setBlockForm({ ...blockForm, name: e.target.value })}
                placeholder="e.g., A, B, North Wing"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Input
                value={blockForm.description}
                onChange={(e) => setBlockForm({ ...blockForm, description: e.target.value })}
                placeholder="e.g., Garden-facing wing"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Total Floors</label>
              <Input
                type="number"
                min="1"
                value={blockForm.totalFloors}
                onChange={(e) => setBlockForm({ ...blockForm, totalFloors: e.target.value })}
                placeholder="2"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCloseBlockDialog} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleBlockSubmit}
                disabled={createBlockMutation.isPending || updateBlockMutation.isPending}
                className="flex-1"
              >
                {editingBlock ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
