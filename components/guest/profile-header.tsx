'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProfileHeaderProps {
  name: string
  email: string | null
  phone: string
}

export function ProfileHeader({ name, email, phone }: ProfileHeaderProps) {
  const router = useRouter()

  return (
    <header className="px-6 pt-12 pb-6">
      <button
        onClick={() => router.back()}
        className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 hover:bg-gray-50 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
          <AvatarImage src="" />
          <AvatarFallback className="bg-gradient-to-br from-pastel-purple to-pastel-lavender text-white text-2xl font-semibold">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          <p className="text-sm text-gray-500">{email || phone}</p>
        </div>
      </div>
    </header>
  )
}
