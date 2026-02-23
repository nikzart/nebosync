'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Wifi, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { staggerContainer, staggerItem, tapScale } from '@/lib/motion'

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
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }))
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
    } catch {
      toast.error('Failed to copy')
    }
  }

  const isCopied = (id: string, type: string) => copiedItems[`${id}-${type}`] === type

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-[#FAF9F6]/90 backdrop-blur-lg z-10 px-5 pt-3 pb-3 border-b border-[#EDECEA]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-[8px] bg-white flex items-center justify-center"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <ArrowLeft className="w-4 h-4 text-[#1C1C1C]" />
          </button>
          <h1 className="text-[18px] font-semibold text-[#1C1C1C]">WiFi Access</h1>
        </div>
      </header>

      <div className="px-5 py-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-[12px] overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="h-[80px] skeleton-shimmer" />
                <div className="p-4 space-y-3">
                  <div className="h-12 rounded-[8px] skeleton-shimmer" />
                  <div className="flex gap-3">
                    <div className="flex-1 h-10 rounded-[8px] skeleton-shimmer" />
                    <div className="flex-1 h-10 rounded-[8px] skeleton-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : credentials && credentials.length > 0 ? (
          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {credentials.map((credential) => (
              <motion.div
                key={credential.id}
                variants={staggerItem}
                className="bg-white rounded-[12px] overflow-hidden"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                {/* WiFi Header — dark green */}
                <div className="bg-[#2D5A3D] p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[8px] bg-white/10 flex items-center justify-center shrink-0">
                      <Wifi className="w-5 h-5 text-[#C9A96E]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white/50 uppercase tracking-wide">Network</p>
                      <p className="text-[18px] font-bold text-white truncate">{credential.ssid}</p>
                    </div>
                    <motion.button
                      {...tapScale}
                      onClick={() => copyToClipboard(credential.ssid, 'ssid', credential.id)}
                      className="w-9 h-9 rounded-[8px] bg-white/15 flex items-center justify-center shrink-0"
                    >
                      {isCopied(credential.id, 'ssid') ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Copy className="w-4 h-4 text-white" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Password Section */}
                <div className="p-4">
                  <p className="text-[12px] text-[#6B6B6B] mb-2">Password</p>
                  <div className="bg-[#FAF9F6] rounded-[8px] p-3 mb-3">
                    <p className="text-[18px] font-mono font-bold text-[#1C1C1C] text-center tracking-wider break-all">
                      {visiblePasswords[credential.id]
                        ? credential.password
                        : '\u2022'.repeat(credential.password.length)}
                    </p>
                  </div>

                  <div className="flex gap-2.5">
                    <motion.button
                      {...tapScale}
                      onClick={() => togglePasswordVisibility(credential.id)}
                      className="flex-1 h-10 rounded-[8px] bg-[#FAF9F6] flex items-center justify-center gap-2 text-[13px] font-medium text-[#1C1C1C]"
                    >
                      {visiblePasswords[credential.id] ? (
                        <><EyeOff className="w-4 h-4" /> Hide</>
                      ) : (
                        <><Eye className="w-4 h-4" /> Show</>
                      )}
                    </motion.button>
                    <motion.button
                      {...tapScale}
                      onClick={() => copyToClipboard(credential.password, 'password', credential.id)}
                      className="flex-1 h-10 rounded-[8px] bg-[#2D5A3D] flex items-center justify-center gap-2 text-[13px] font-semibold text-white"
                    >
                      {isCopied(credential.id, 'password') ? (
                        <><Check className="w-4 h-4" /> Copied!</>
                      ) : (
                        <><Copy className="w-4 h-4" /> Copy</>
                      )}
                    </motion.button>
                  </div>

                  {credential.description && (
                    <div className="mt-3 p-3 bg-[#EDF3FA] rounded-[8px]">
                      <p className="text-[13px] text-[#4A7EC4] leading-relaxed">
                        {credential.description}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <div className="w-14 h-14 rounded-full bg-[#EBF3ED] flex items-center justify-center mb-4">
              <Wifi className="w-6 h-6 text-[#2D5A3D]" />
            </div>
            <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-1">No WiFi Networks</h2>
            <p className="text-[13px] text-[#A1A1A1] text-center max-w-[260px]">
              Please contact the front desk for WiFi credentials
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
