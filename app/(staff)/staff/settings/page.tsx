'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
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
  Settings as SettingsIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  // Hotel Information
  const [hotelInfo, setHotelInfo] = useState({
    name: 'NeboSync Hotel',
    address: '123 Hotel Street, City, State 12345',
    phone: '+91 98765 43210',
    email: 'contact@nebosync.hotel',
    website: 'https://nebosync.hotel',
  })

  // WiFi Settings
  const [wifiSettings, setWifiSettings] = useState({
    ssid: 'NeboSync_Guest_WiFi',
    password: 'WelcomeGuest2024',
    staffSsid: 'NeboSync_Staff_WiFi',
    staffPassword: 'StaffAccess2024',
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newOrderNotifications: true,
    newMessageNotifications: true,
    checkInNotifications: true,
    checkOutNotifications: true,
  })

  const handleSaveHotelInfo = () => {
    // In production, this would save to an API
    toast.success('Hotel information saved successfully')
  }

  const handleSaveWifiSettings = () => {
    // In production, this would save to an API
    toast.success('WiFi settings saved successfully')
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hotel" className="gap-2">
            <Hotel className="w-4 h-4" />
            <span className="hidden sm:inline">Hotel Info</span>
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
              <div>
                <label className="text-sm font-medium mb-2 block">Hotel Name</label>
                <Input
                  value={hotelInfo.name}
                  onChange={(e) =>
                    setHotelInfo({ ...hotelInfo, name: e.target.value })
                  }
                  placeholder="Hotel name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Address</label>
                <Input
                  value={hotelInfo.address}
                  onChange={(e) =>
                    setHotelInfo({ ...hotelInfo, address: e.target.value })
                  }
                  placeholder="Full address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <Input
                    value={hotelInfo.phone}
                    onChange={(e) =>
                      setHotelInfo({ ...hotelInfo, phone: e.target.value })
                    }
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={hotelInfo.email}
                    onChange={(e) =>
                      setHotelInfo({ ...hotelInfo, email: e.target.value })
                    }
                    placeholder="Email address"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Website</label>
                <Input
                  value={hotelInfo.website}
                  onChange={(e) =>
                    setHotelInfo({ ...hotelInfo, website: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <Button onClick={handleSaveHotelInfo} className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WiFi Settings */}
        <TabsContent value="wifi">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Guest WiFi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Network Name (SSID)</label>
                  <Input
                    value={wifiSettings.ssid}
                    onChange={(e) =>
                      setWifiSettings({ ...wifiSettings, ssid: e.target.value })
                    }
                    placeholder="WiFi network name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <Input
                    type="text"
                    value={wifiSettings.password}
                    onChange={(e) =>
                      setWifiSettings({ ...wifiSettings, password: e.target.value })
                    }
                    placeholder="WiFi password"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Staff WiFi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Network Name (SSID)</label>
                  <Input
                    value={wifiSettings.staffSsid}
                    onChange={(e) =>
                      setWifiSettings({ ...wifiSettings, staffSsid: e.target.value })
                    }
                    placeholder="Staff WiFi network name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <Input
                    type="text"
                    value={wifiSettings.staffPassword}
                    onChange={(e) =>
                      setWifiSettings({ ...wifiSettings, staffPassword: e.target.value })
                    }
                    placeholder="Staff WiFi password"
                  />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveWifiSettings} className="gap-2">
              <Save className="w-4 h-4" />
              Save WiFi Settings
            </Button>
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
