'use client'

interface ProfileHeaderProps {
  name: string
  email: string | null
  phone: string
}

export function ProfileHeader({ name, email, phone }: ProfileHeaderProps) {
  return (
    <header className="px-5 pt-12 pb-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#2D5A3D] flex items-center justify-center">
          <span className="text-[24px] font-semibold text-white">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-[20px] font-semibold text-[#1C1C1C]">{name}</h1>
          <p className="text-[13px] text-[#6B6B6B]">{email || phone}</p>
        </div>
      </div>
    </header>
  )
}
