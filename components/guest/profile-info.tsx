'use client'

import { Mail, Phone, Building, Home } from 'lucide-react'

interface ProfileInfoProps {
  name: string
  email: string | null
  phone: string
  roomNumber?: string
  roomType?: string
  floor?: number
}

export function ProfileInfo({ email, phone, roomNumber, roomType, floor }: ProfileInfoProps) {
  return (
    <div className="bg-white rounded-[12px] p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-4">Personal Information</h2>

      <div className="space-y-3.5">
        {email && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#EBF3ED] flex items-center justify-center">
              <Mail className="w-4 h-4 text-[#2D5A3D]" />
            </div>
            <div>
              <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide">Email</p>
              <p className="text-[14px] font-medium text-[#1C1C1C]">{email}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#EBF3ED] flex items-center justify-center">
            <Phone className="w-4 h-4 text-[#2D5A3D]" />
          </div>
          <div>
            <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide">Phone</p>
            <p className="text-[14px] font-medium text-[#1C1C1C]">{phone}</p>
          </div>
        </div>

        {roomNumber && (
          <>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[8px] bg-[#EBF3ED] flex items-center justify-center">
                <Home className="w-4 h-4 text-[#2D5A3D]" />
              </div>
              <div>
                <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide">Room Number</p>
                <p className="text-[14px] font-medium text-[#1C1C1C]">{roomNumber}</p>
              </div>
            </div>

            {roomType && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[8px] bg-[#F5F0E4] flex items-center justify-center">
                  <Building className="w-4 h-4 text-[#C9A96E]" />
                </div>
                <div>
                  <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide">Room Type</p>
                  <p className="text-[14px] font-medium text-[#1C1C1C]">{roomType}</p>
                </div>
              </div>
            )}

            {floor && (
              <div className="ml-12">
                <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide">Floor</p>
                <p className="text-[14px] font-medium text-[#1C1C1C]">Floor {floor}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
