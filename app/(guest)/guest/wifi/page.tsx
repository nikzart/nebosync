'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Wifi, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface WiFiCredential {
  id: string
  ssid: string
  password: string
  description: string | null
  isActive: boolean
}

export default function WiFiPage() {
  const router = useRouter()
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({})
  const [copiedItems, setCopiedItems] = useState<Record<string, string>>({})

  const { data: credentials, isLoading } = useQuery<WiFiCredential[]>({
    queryKey: ['wifi-credentials'],
    queryFn: async () => {
      const res = await fetch('/api/wifi')
      if (!res.ok) throw new Error('Failed to fetch WiFi credentials')
      return res.json()
    },
  })

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const copyToClipboard = async (text: string, type: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      const key = `${id}-${type}`
      setCopiedItems((prev) => ({ ...prev, [key]: type }))
      toast.success(`${type === 'ssid' ? 'Network name' : 'Password'} copied!`)

      setTimeout(() => {
        setCopiedItems((prev) => {
          const newState = { ...prev }
          delete newState[key]
          return newState
        })
      }, 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const isCopied = (id: string, type: string) => {
    return copiedItems[`${id}-${type}`] === type
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pb-28">
      {/* Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-xl z-10 px-6 py-5 border-b border-gray-100/50 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-all hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 text-purple-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex-1">WiFi Access</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 pt-6">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-64 bg-white/50 rounded-[2rem] animate-pulse"
              />
            ))}
          </div>
        ) : credentials && credentials.length > 0 ? (
          <div className="space-y-6">
            {credentials.map((credential, index) => (
              <motion.div
                key={credential.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[2rem] shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* WiFi Header */}
                <div
                  className="p-6"
                  style={{
                    background: 'linear-gradient(135deg, #c4b5fd 0%, #e0d7ff 100%)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/90 flex items-center justify-center flex-shrink-0">
                      <Wifi className="w-7 h-7 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 font-medium mb-1">Network Name</p>
                      <p className="text-2xl font-bold text-white break-all">
                        {credential.ssid}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(credential.ssid, 'ssid', credential.id)}
                      className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all flex-shrink-0"
                    >
                      {isCopied(credential.id, 'ssid') ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Copy className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Section */}
                <div className="p-6">
                  <p className="text-sm text-gray-600 font-medium mb-3">Password</p>
                  <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                    <p className="text-2xl font-mono font-bold text-gray-900 text-center tracking-wider break-all">
                      {visiblePasswords[credential.id]
                        ? credential.password
                        : '•'.repeat(credential.password.length)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => togglePasswordVisibility(credential.id)}
                      className="flex-1 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2 transition-all font-medium text-gray-700"
                    >
                      {visiblePasswords[credential.id] ? (
                        <>
                          <EyeOff className="w-5 h-5" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-5 h-5" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(credential.password, 'password', credential.id)}
                      className="flex-1 h-12 rounded-xl bg-lime-accent hover:bg-lime-accent/90 flex items-center justify-center gap-2 transition-all font-medium text-gray-900"
                    >
                      {isCopied(credential.id, 'password') ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  {credential.description && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {credential.description}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Empty state
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center mb-6">
              <Wifi className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No WiFi Networks</h3>
            <p className="text-gray-500 text-center max-w-sm">
              WiFi credentials are not available at the moment. Please contact the front desk for assistance.
            </p>
          </motion.div>
        )}
      </div>

      {/* Bottom spacing for navigation */}
      <div className="h-8" />
    </div>
  )
}
