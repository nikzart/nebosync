'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Search, Leaf, Drumstick } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface FoodItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  imageUrl: string | null
  isAvailable: boolean
  isVeg: boolean
}

export default function FoodMenuManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    isVeg: true,
    isAvailable: true,
  })

  const queryClient = useQueryClient()

  const { data: foodItems, isLoading } = useQuery<FoodItem[]>({
    queryKey: ['all-food-menu'],
    queryFn: async () => {
      const res = await fetch('/api/food-menu')
      if (!res.ok) throw new Error('Failed to fetch food menu')
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/food-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          price: parseFloat(data.price),
          category: data.category,
          imageUrl: data.imageUrl || null,
          isVeg: data.isVeg,
          isAvailable: data.isAvailable,
        }),
      })
      if (!res.ok) throw new Error('Failed to create food item')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-food-menu'] })
      toast.success('Food item created successfully')
      handleCloseDialog()
    },
    onError: () => {
      toast.error('Failed to create food item')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`/api/food-menu/${editingItem?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          price: parseFloat(data.price),
          category: data.category,
          imageUrl: data.imageUrl || null,
          isVeg: data.isVeg,
          isAvailable: data.isAvailable,
        }),
      })
      if (!res.ok) throw new Error('Failed to update food item')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-food-menu'] })
      toast.success('Food item updated successfully')
      handleCloseDialog()
    },
    onError: () => {
      toast.error('Failed to update food item')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/food-menu/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete food item')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-food-menu'] })
      toast.success('Food item deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete food item')
    },
  })

  const filteredItems = foodItems?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category,
      imageUrl: item.imageUrl || '',
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: '',
      isVeg: true,
      isAvailable: true,
    })
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    if (editingItem) {
      await updateMutation.mutateAsync(formData)
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Food Menu Management</h1>
          <p className="text-muted-foreground">
            Manage restaurant menu items and pricing
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Item name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Item description"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Price (₹)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Breakfast, Lunch, Beverages"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Image URL (optional)
                </label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isVeg"
                    checked={formData.isVeg}
                    onChange={(e) =>
                      setFormData({ ...formData, isVeg: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="isVeg" className="text-sm font-medium">
                    Vegetarian
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) =>
                      setFormData({ ...formData, isAvailable: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="isAvailable" className="text-sm font-medium">
                    Available
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                >
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Food Items Grid */}
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
      ) : filteredItems && filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div
                    className="h-32 rounded-lg mb-4 bg-gradient-to-br from-primary/10 to-primary/5"
                    style={{
                      ...(item.imageUrl && {
                        backgroundImage: `url(${item.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }),
                    }}
                  />
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.isVeg ? (
                          <Leaf className="w-4 h-4 text-green-500" />
                        ) : (
                          <Drumstick className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        ₹{item.price.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.category}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.isAvailable
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      }`}
                    >
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery ? 'No items match your search' : 'No food items yet'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
