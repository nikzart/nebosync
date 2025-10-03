'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Hotel,
  Wifi,
  Bell,
  Shield,
  Palette,
  Save,
  Settings as SettingsIcon,
  Plus,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'

interface WiFiCredential {
  id: string
  ssid: string
  password: string
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface HotelSettings {
  id: string
  hotelName: string
  address: string
  phone: string
  email: string
  website: string
  logoUrl: string | null
  taxRate: number
  taxLabel: string
  taxRegistration: string | null
  invoicePrefix: string
  invoiceFooter: string
  bankName: string | null
  accountNumber: string | null
  ifscCode: string | null
  accountName: string | null
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const queryClient = useQueryClient()

  // Fetch Hotel Settings
  const { data: hotelSettings, isLoading: hotelLoading } = useQuery<HotelSettings>({
    queryKey: ['hotel-settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings/hotel')
      if (!res.ok) throw new Error('Failed to fetch hotel settings')
      return res.json()
    },
  })

  // Local state for editing hotel info
  const [editingHotelInfo, setEditingHotelInfo] = useState<Partial<HotelSettings> | null>(null)

  // Fetch WiFi credentials
  const { data: wifiCredentials, isLoading: wifiLoading } = useQuery<WiFiCredential[]>({
    queryKey: ['wifi-credentials'],
    queryFn: async () => {
      const res = await fetch('/api/wifi')
      if (!res.ok) throw new Error('Failed to fetch WiFi credentials')
      return res.json()
    },
  })

  // Local state for editing
  const [editingWifi, setEditingWifi] = useState<Partial<WiFiCredential> | null>(null)
  const [newWifi, setNewWifi] = useState({ ssid: '', password: '', description: '' })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newOrderNotifications: true,
    newMessageNotifications: true,
    checkInNotifications: true,
    checkOutNotifications: true,
  })

  const updateHotelMutation = useMutation({
    mutationFn: async (data: Partial<HotelSettings>) => {
      const res = await fetch('/api/settings/hotel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update hotel settings')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-settings'] })
      toast.success('Hotel settings saved successfully')
      setEditingHotelInfo(null)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSaveHotelInfo = () => {
    if (!editingHotelInfo) return
    updateHotelMutation.mutate(editingHotelInfo)
  }

  const createWifiMutation = useMutation({
    mutationFn: async (data: typeof newWifi) => {
      const res = await fetch('/api/wifi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create WiFi credential')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-credentials'] })
      toast.success('WiFi credential created successfully')
      setNewWifi({ ssid: '', password: '', description: '' })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const updateWifiMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<WiFiCredential> & { id: string }) => {
      const res = await fetch(`/api/wifi/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update WiFi credential')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-credentials'] })
      toast.success('WiFi credential updated successfully')
      setEditingWifi(null)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteWifiMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/wifi/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete WiFi credential')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifi-credentials'] })
      toast.success('WiFi credential deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleCreateWifi = () => {
    if (!newWifi.ssid || !newWifi.password) {
      toast.error('SSID and password are required')
      return
    }
    createWifiMutation.mutate(newWifi)
  }

  const handleUpdateWifi = () => {
    if (!editingWifi?.id) return
    updateWifiMutation.mutate(editingWifi as WiFiCredential)
  }

  const handleDeleteWifi = (id: string) => {
    if (confirm('Are you sure you want to delete this WiFi credential?')) {
      deleteWifiMutation.mutate(id)
    }
  }

  const handleSaveNotifications = () => {
    // In production, this would save to an API
    toast.success('Notification settings saved successfully')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage hotel settings and preferences
        </p>
      </div>

      <Tabs defaultValue="hotel" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hotel" className="gap-2">
            <Hotel className="w-4 h-4" />
            <span className="hidden sm:inline">Hotel Info</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <SettingsIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Billing & Tax</span>
          </TabsTrigger>
          <TabsTrigger value="wifi" className="gap-2">
            <Wifi className="w-4 h-4" />
            <span className="hidden sm:inline">WiFi</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Hotel Information */}
        <TabsContent value="hotel">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                Hotel Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hotelLoading ? (
                <p className="text-muted-foreground">Loading hotel information...</p>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hotel Name</label>
                    <Input
                      value={editingHotelInfo?.hotelName ?? hotelSettings?.hotelName ?? ''}
                      onChange={(e) =>
                        setEditingHotelInfo({ ...hotelSettings, ...editingHotelInfo, hotelName: e.target.value })
                      }
                      placeholder="Hotel name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Address</label>
                    <Input
                      value={editingHotelInfo?.address ?? hotelSettings?.address ?? ''}
                      onChange={(e) =>
                        setEditingHotelInfo({ ...hotelSettings, ...editingHotelInfo, address: e.target.value })
                      }
                      placeholder="Full address"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone</label>
                      <Input
                        value={editingHotelInfo?.phone ?? hotelSettings?.phone ?? ''}
                        onChange={(e) =>
                          setEditingHotelInfo({ ...hotelSettings, ...editingHotelInfo, phone: e.target.value })
                        }
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        type="email"
                        value={editingHotelInfo?.email ?? hotelSettings?.email ?? ''}
                        onChange={(e) =>
                          setEditingHotelInfo({ ...hotelSettings, ...editingHotelInfo, email: e.target.value })
                        }
                        placeholder="Email address"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Website</label>
                    <Input
                      value={editingHotelInfo?.website ?? hotelSettings?.website ?? ''}
                      onChange={(e) =>
                        setEditingHotelInfo({ ...hotelSettings, ...editingHotelInfo, website: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <Button
                    onClick={handleSaveHotelInfo}
                    disabled={updateHotelMutation.isPending || !editingHotelInfo}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing & Tax Configuration */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Billing & Tax Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {hotelLoading ? (
                <p className="text-muted-foreground">Loading billing configuration...</p>
              ) : (
                <>
                  {/* Tax Settings */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold">Tax Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Tax Rate (%)</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={((editingHotelInfo?.taxRate ?? hotelSettings?.taxRate ?? 0.18) * 100).toFixed(2)}
                          onChange={(e) =>
                            setEditingHotelInfo({
                              ...hotelSettings,
                              ...editingHotelInfo,
                              taxRate: parseFloat(e.target.value) / 100,
                            })
                          }
                          placeholder="18.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter as percentage (e.g., 18 for 18%)
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Tax Label</label>
                        <Input
                          value={editingHotelInfo?.taxLabel ?? hotelSettings?.taxLabel ?? ''}
                          onChange={(e) =>
                            setEditingHotelInfo({ ...hotelSettings, ...editingHotelInfo, taxLabel: e.target.value })
                          }
                          placeholder="GST, VAT, etc."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Tax Registration Number (GSTIN)
                      </label>
                      <Input
                        value={editingHotelInfo?.taxRegistration ?? hotelSettings?.taxRegistration ?? ''}
                        onChange={(e) =>
                          setEditingHotelInfo({
                            ...hotelSettings,
                            ...editingHotelInfo,
                            taxRegistration: e.target.value,
                          })
                        }
                        placeholder="e.g., 22AAAAA0000A1Z5"
                      />
                    </div>
                  </div>

                  {/* Invoice Settings */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold">Invoice Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Invoice Prefix</label>
                        <Input
                          value={editingHotelInfo?.invoicePrefix ?? hotelSettings?.invoicePrefix ?? ''}
                          onChange={(e) =>
                            setEditingHotelInfo({
                              ...hotelSettings,
                              ...editingHotelInfo,
                              invoicePrefix: e.target.value,
                            })
                          }
                          placeholder="INV"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Example: INV-20231225-1234
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Invoice Footer Text</label>
                      <Input
                        value={editingHotelInfo?.invoiceFooter ?? hotelSettings?.invoiceFooter ?? ''}
                        onChange={(e) =>
                          setEditingHotelInfo({
                            ...hotelSettings,
                            ...editingHotelInfo,
                            invoiceFooter: e.target.value,
                          })
                        }
                        placeholder="Thank you message..."
                      />
                    </div>
                  </div>

                  {/* Banking Details */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold">Banking Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Bank details will be displayed on invoices for payment reference
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Bank Name</label>
                        <Input
                          value={editingHotelInfo?.bankName ?? hotelSettings?.bankName ?? ''}
                          onChange={(e) =>
                            setEditingHotelInfo({ ...hotelSettings, ...editingHotelInfo, bankName: e.target.value })
                          }
                          placeholder="e.g., HDFC Bank"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Account Name</label>
                        <Input
                          value={editingHotelInfo?.accountName ?? hotelSettings?.accountName ?? ''}
                          onChange={(e) =>
                            setEditingHotelInfo({
                              ...hotelSettings,
                              ...editingHotelInfo,
                              accountName: e.target.value,
                            })
                          }
                          placeholder="Account holder name"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Account Number</label>
                        <Input
                          value={editingHotelInfo?.accountNumber ?? hotelSettings?.accountNumber ?? ''}
                          onChange={(e) =>
                            setEditingHotelInfo({
                              ...hotelSettings,
                              ...editingHotelInfo,
                              accountNumber: e.target.value,
                            })
                          }
                          placeholder="Bank account number"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">IFSC Code</label>
                        <Input
                          value={editingHotelInfo?.ifscCode ?? hotelSettings?.ifscCode ?? ''}
                          onChange={(e) =>
                            setEditingHotelInfo({ ...hotelSettings, ...editingHotelInfo, ifscCode: e.target.value })
                          }
                          placeholder="e.g., HDFC0001234"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveHotelInfo}
                    disabled={updateHotelMutation.isPending || !editingHotelInfo}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Billing Configuration
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WiFi Settings */}
        <TabsContent value="wifi">
          <div className="space-y-6">
            {/* Create New WiFi Credential */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New WiFi Network
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Network Name (SSID) *</label>
                  <Input
                    value={newWifi.ssid}
                    onChange={(e) => setNewWifi({ ...newWifi, ssid: e.target.value })}
                    placeholder="e.g. NeboSync_Guest_WiFi"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Password *</label>
                  <Input
                    type="text"
                    value={newWifi.password}
                    onChange={(e) => setNewWifi({ ...newWifi, password: e.target.value })}
                    placeholder="WiFi password"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Input
                    value={newWifi.description}
                    onChange={(e) => setNewWifi({ ...newWifi, description: e.target.value })}
                    placeholder="e.g. Guest WiFi, Staff WiFi"
                  />
                </div>
                <Button
                  onClick={handleCreateWifi}
                  disabled={createWifiMutation.isPending}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create WiFi Network
                </Button>
              </CardContent>
            </Card>

            {/* Existing WiFi Credentials */}
            {wifiLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Loading WiFi credentials...</p>
                </CardContent>
              </Card>
            ) : wifiCredentials && wifiCredentials.length > 0 ? (
              wifiCredentials.map((credential) => (
                <Card key={credential.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-5 h-5" />
                        {editingWifi?.id === credential.id ? (
                          <Input
                            value={editingWifi.description || ''}
                            onChange={(e) =>
                              setEditingWifi({ ...editingWifi, description: e.target.value })
                            }
                            placeholder="Description"
                            className="w-48"
                          />
                        ) : (
                          <span>{credential.description || 'WiFi Network'}</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteWifi(credential.id)}
                        disabled={deleteWifiMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Network Name (SSID)</label>
                      {editingWifi?.id === credential.id ? (
                        <Input
                          value={editingWifi.ssid}
                          onChange={(e) =>
                            setEditingWifi({ ...editingWifi, ssid: e.target.value })
                          }
                          placeholder="SSID"
                        />
                      ) : (
                        <Input value={credential.ssid} readOnly className="bg-muted" />
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Password</label>
                      {editingWifi?.id === credential.id ? (
                        <Input
                          type="text"
                          value={editingWifi.password}
                          onChange={(e) =>
                            setEditingWifi({ ...editingWifi, password: e.target.value })
                          }
                          placeholder="Password"
                        />
                      ) : (
                        <Input value={credential.password} readOnly className="bg-muted" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      {editingWifi?.id === credential.id ? (
                        <>
                          <Button
                            onClick={handleUpdateWifi}
                            disabled={updateWifiMutation.isPending}
                            className="gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingWifi(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setEditingWifi(credential)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Wifi className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No WiFi credentials</h2>
                  <p className="text-muted-foreground">
                    Create your first WiFi network using the form above
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      emailNotifications: e.target.checked,
                    })
                  }
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">New Order Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when guests place orders
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.newOrderNotifications}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      newOrderNotifications: e.target.checked,
                    })
                  }
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">New Message Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when guests send messages
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.newMessageNotifications}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      newMessageNotifications: e.target.checked,
                    })
                  }
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Check-in Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when guests check in
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.checkInNotifications}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      checkInNotifications: e.target.checked,
                    })
                  }
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Check-out Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when guests check out
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.checkOutNotifications}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      checkOutNotifications: e.target.checked,
                    })
                  }
                  className="w-5 h-5"
                />
              </div>

              <Button onClick={handleSaveNotifications} className="gap-2">
                <Save className="w-4 h-4" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Theme</label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="w-full h-20 bg-white rounded mb-2 border" />
                    <p className="text-sm font-medium">Light</p>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="w-full h-20 bg-gray-900 rounded mb-2 border" />
                    <p className="text-sm font-medium">Dark</p>
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'system'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="w-full h-20 bg-gradient-to-r from-white to-gray-900 rounded mb-2 border" />
                    <p className="text-sm font-medium">System</p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Your Account</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{session?.user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{session?.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-medium">{session?.user?.role}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Change Password</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Current Password
                    </label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      New Password
                    </label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Confirm New Password
                    </label>
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Update Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
