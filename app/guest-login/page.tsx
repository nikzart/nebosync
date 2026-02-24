'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Phone, DoorOpen, ArrowRight, Loader2, Wifi, Utensils, Bell, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { guestLogin } from '@/app/login/actions'

const ease = [0.25, 0.1, 0.25, 1] as const

const containerVariants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
}

export default function GuestLoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [phone, setPhone] = useState('')
  const [room, setRoom] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await guestLogin(phone, room)
      if (result?.error) {
        toast.error('Login failed', { description: result.error })
      } else if (result?.success) {
        toast.success('Welcome!')
        router.push(result.redirectTo)
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#FAF9F6' }}>
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'rgba(45, 90, 61, 0.08)', top: '-15%', right: '-10%' }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'rgba(201, 169, 110, 0.06)', bottom: '-10%', left: '-10%' }}
        />
        <div
          className="absolute w-[200px] h-[200px] rounded-full blur-[80px]"
          style={{ background: 'rgba(45, 90, 61, 0.04)', top: '50%', left: '20%' }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          className="w-full max-w-[380px]"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {/* Logo */}
          <motion.div className="flex justify-center mb-8" variants={itemVariants}>
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.05 }}
            >
              <div
                className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(145deg, #2D5A3D, #3E7B54)',
                  boxShadow: '0 12px 40px -8px rgba(45, 90, 61, 0.4)',
                }}
              >
                <span className="text-white font-bold text-[28px] tracking-tight">N</span>
              </div>
              {/* Subtle ring */}
              <div
                className="absolute -inset-1.5 rounded-[26px] -z-10"
                style={{ border: '1px solid rgba(45, 90, 61, 0.12)' }}
              />
            </motion.div>
          </motion.div>

          {/* Heading */}
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <h1 className="text-[28px] font-bold tracking-tight leading-tight" style={{ color: '#1C1C1C' }}>
              Welcome to your stay
            </h1>
            <p className="mt-2.5 text-[15px] leading-relaxed" style={{ color: '#8A8A8A' }}>
              Access room services, dining, and more
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div className="flex justify-center gap-2 mb-8" variants={itemVariants}>
            {[
              { icon: Utensils, label: 'Dining' },
              { icon: Bell, label: 'Services' },
              { icon: Wifi, label: 'WiFi' },
              { icon: MessageCircle, label: 'Chat' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: '#ffffff',
                  color: '#6B6B6B',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  border: '1px solid #F0EFEC',
                }}
              >
                <item.icon className="w-3 h-3" style={{ color: '#2D5A3D' }} />
                {item.label}
              </div>
            ))}
          </motion.div>

          {/* Login Card */}
          <motion.div
            className="rounded-[28px] p-8 mb-5"
            style={{
              background: '#ffffff',
              boxShadow: '0 8px 40px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
            }}
            variants={itemVariants}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="guest-phone"
                  className="block text-[13px] font-semibold uppercase tracking-wide mb-2.5"
                  style={{ color: focusedField === 'phone' ? '#2D5A3D' : '#A1A1A1' }}
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200"
                    style={{
                      background: focusedField === 'phone' ? 'rgba(45, 90, 61, 0.08)' : '#F5F4F1',
                    }}
                  >
                    <Phone
                      className="w-[16px] h-[16px] transition-colors duration-200"
                      style={{ color: focusedField === 'phone' ? '#2D5A3D' : '#B5B5B5' }}
                    />
                  </div>
                  <input
                    id="guest-phone"
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoComplete="tel"
                    className="w-full h-[56px] pl-[60px] pr-4 rounded-2xl text-[15px] outline-none transition-all duration-200 placeholder:text-[#CDCDCD]"
                    style={{
                      background: focusedField === 'phone' ? '#FAFFF6' : '#F9F8F5',
                      border: `2px solid ${focusedField === 'phone' ? '#2D5A3D' : 'transparent'}`,
                      color: '#1C1C1C',
                    }}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </motion.div>

              {/* Room */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="guest-room"
                  className="block text-[13px] font-semibold uppercase tracking-wide mb-2.5"
                  style={{ color: focusedField === 'room' ? '#2D5A3D' : '#A1A1A1' }}
                >
                  Room Number
                </label>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200"
                    style={{
                      background: focusedField === 'room' ? 'rgba(45, 90, 61, 0.08)' : '#F5F4F1',
                    }}
                  >
                    <DoorOpen
                      className="w-[16px] h-[16px] transition-colors duration-200"
                      style={{ color: focusedField === 'room' ? '#2D5A3D' : '#B5B5B5' }}
                    />
                  </div>
                  <input
                    id="guest-room"
                    type="text"
                    placeholder="e.g. 101"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    required
                    className="w-full h-[56px] pl-[60px] pr-4 rounded-2xl text-[15px] outline-none transition-all duration-200 placeholder:text-[#CDCDCD]"
                    style={{
                      background: focusedField === 'room' ? '#FAFFF6' : '#F9F8F5',
                      border: `2px solid ${focusedField === 'room' ? '#2D5A3D' : 'transparent'}`,
                      color: '#1C1C1C',
                    }}
                    onFocus={() => setFocusedField('room')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div className="pt-1" variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-[56px] rounded-2xl text-[15px] font-semibold text-white flex items-center justify-center gap-2.5 disabled:cursor-not-allowed relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #2D5A3D, #3E7B54)',
                    boxShadow: isPending ? 'none' : '0 8px 24px -6px rgba(45, 90, 61, 0.4)',
                    opacity: isPending ? 0.7 : 1,
                  }}
                  whileTap={isPending ? {} : { scale: 0.985 }}
                  whileHover={isPending ? {} : { boxShadow: '0 12px 32px -6px rgba(45, 90, 61, 0.5)' }}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-[18px] h-[18px] animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-[18px] h-[18px]" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>

          {/* Gold divider */}
          <motion.div className="flex items-center gap-4 mb-5 px-4" variants={itemVariants}>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, #E5E4E0)' }} />
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full" style={{ background: '#C9A96E' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A96E' }} />
              <div className="w-1 h-1 rounded-full" style={{ background: '#C9A96E' }} />
            </div>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, #E5E4E0)' }} />
          </motion.div>

          {/* Staff link */}
          <motion.div className="text-center" variants={itemVariants}>
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 text-[13px] font-medium transition-colors duration-200"
              style={{ color: '#A1A1A1' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2D5A3D')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#A1A1A1')}
            >
              Staff member?
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] transition-all duration-200"
                style={{ background: '#F2F0EC', color: '#6B6B6B' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(45, 90, 61, 0.08)'
                  e.currentTarget.style.color = '#2D5A3D'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F2F0EC'
                  e.currentTarget.style.color = '#6B6B6B'
                }}
              >
                Login here <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
