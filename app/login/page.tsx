'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Loader2, LayoutDashboard, ShoppingCart, BarChart3, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { staffLogin } from './actions'

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

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await staffLogin(email, password)
      if (result?.error) {
        toast.error('Login failed', { description: result.error })
      } else if (result?.success) {
        toast.success('Login successful!')
        router.push(result.redirectTo)
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#08080a' }}>
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{ background: 'rgba(163, 255, 87, 0.06)', top: '-20%', right: '-15%' }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'rgba(255, 136, 68, 0.04)', bottom: '-15%', left: '-12%' }}
        />
        <div
          className="absolute w-[250px] h-[250px] rounded-full blur-[100px]"
          style={{ background: 'rgba(163, 255, 87, 0.03)', top: '40%', left: '30%' }}
        />
        {/* Animated mesh grid */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute animate-mesh-drift"
            style={{
              inset: '-50%',
              backgroundImage:
                'linear-gradient(rgba(163,255,87,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(163,255,87,0.15) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black 20%, transparent 70%)',
              opacity: 0.4,
            }}
          />

        </div>
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
                  background: 'linear-gradient(145deg, #a3ff57, #82e03e)',
                  boxShadow: '0 12px 40px -8px rgba(163, 255, 87, 0.35)',
                }}
              >
                <span className="font-bold text-[28px] tracking-tight" style={{ color: '#08080a' }}>N</span>
              </div>
              <div
                className="absolute -inset-1.5 rounded-[26px] -z-10"
                style={{ border: '1px solid rgba(163, 255, 87, 0.15)' }}
              />
            </motion.div>
          </motion.div>

          {/* Heading */}
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <h1 className="text-[28px] font-bold tracking-tight leading-tight" style={{ color: '#f0f0f0' }}>
              Staff Portal
            </h1>
            <p className="mt-2.5 text-[15px] leading-relaxed" style={{ color: '#6b7280' }}>
              Manage operations, orders, and guests
            </p>
          </motion.div>

          {/* Quick access pills */}
          <motion.div className="flex justify-center gap-2 mb-8" variants={itemVariants}>
            {[
              { icon: LayoutDashboard, label: 'Dashboard' },
              { icon: ShoppingCart, label: 'Orders' },
              { icon: BarChart3, label: 'Analytics' },
              { icon: MessageSquare, label: 'Messages' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  color: '#6b7280',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <item.icon className="w-3 h-3" style={{ color: '#a3ff57' }} />
                {item.label}
              </div>
            ))}
          </motion.div>

          {/* Login Card */}
          <motion.div
            className="rounded-[28px] p-8 mb-5"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
              boxShadow: '0 8px 40px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            variants={itemVariants}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="staff-email"
                  className="block text-[13px] font-semibold uppercase tracking-wide mb-2.5 transition-colors duration-200"
                  style={{ color: focusedField === 'email' ? '#a3ff57' : '#6b7280' }}
                >
                  Email
                </label>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200"
                    style={{
                      background: focusedField === 'email' ? 'rgba(163, 255, 87, 0.1)' : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <Mail
                      className="w-[16px] h-[16px] transition-colors duration-200"
                      style={{ color: focusedField === 'email' ? '#a3ff57' : '#4b5563' }}
                    />
                  </div>
                  <input
                    id="staff-email"
                    type="email"
                    placeholder="staff@hotel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full h-[56px] pl-[60px] pr-4 rounded-2xl text-[15px] outline-none transition-all duration-200 placeholder:text-[#3a3a3a]"
                    style={{
                      background: focusedField === 'email' ? 'rgba(163, 255, 87, 0.04)' : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${focusedField === 'email' ? 'rgba(163, 255, 87, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                      color: '#f0f0f0',
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="staff-password"
                  className="block text-[13px] font-semibold uppercase tracking-wide mb-2.5 transition-colors duration-200"
                  style={{ color: focusedField === 'password' ? '#a3ff57' : '#6b7280' }}
                >
                  Password
                </label>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200"
                    style={{
                      background: focusedField === 'password' ? 'rgba(163, 255, 87, 0.1)' : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <Lock
                      className="w-[16px] h-[16px] transition-colors duration-200"
                      style={{ color: focusedField === 'password' ? '#a3ff57' : '#4b5563' }}
                    />
                  </div>
                  <input
                    id="staff-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full h-[56px] pl-[60px] pr-4 rounded-2xl text-[15px] outline-none transition-all duration-200 placeholder:text-[#3a3a3a]"
                    style={{
                      background: focusedField === 'password' ? 'rgba(163, 255, 87, 0.04)' : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${focusedField === 'password' ? 'rgba(163, 255, 87, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                      color: '#f0f0f0',
                    }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div className="pt-1" variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-[56px] rounded-2xl text-[15px] font-semibold flex items-center justify-center gap-2.5 disabled:cursor-not-allowed relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #a3ff57, #82e03e)',
                    color: '#08080a',
                    boxShadow: isPending ? 'none' : '0 8px 24px -6px rgba(163, 255, 87, 0.35)',
                    opacity: isPending ? 0.7 : 1,
                  }}
                  whileTap={isPending ? {} : { scale: 0.985 }}
                  whileHover={isPending ? {} : { boxShadow: '0 12px 32px -6px rgba(163, 255, 87, 0.45)' }}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-[18px] h-[18px] animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-[18px] h-[18px]" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>

          {/* Divider */}
          <motion.div className="flex items-center gap-4 mb-5 px-4" variants={itemVariants}>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06))' }} />
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full" style={{ background: '#ff8844' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff8844' }} />
              <div className="w-1 h-1 rounded-full" style={{ background: '#ff8844' }} />
            </div>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.06))' }} />
          </motion.div>

          {/* Guest link */}
          <motion.div className="text-center" variants={itemVariants}>
            <Link
              href="/guest-login"
              className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors duration-200"
              style={{ color: '#4b5563' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#a3ff57')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
            >
              Hotel guest?
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(163, 255, 87, 0.1)'
                  e.currentTarget.style.color = '#a3ff57'
                  e.currentTarget.style.borderColor = 'rgba(163, 255, 87, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.color = '#6b7280'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
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
