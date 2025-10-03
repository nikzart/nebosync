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

export function ProfileInfo({ name, email, phone, roomNumber, roomType, floor }: ProfileInfoProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>

      <div className="space-y-4">
        {/* Email */}
        {email && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pastel-lavender flex items-center justify-center">
              <Mail className="w-5 h-5 text-pastel-purple" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">{email}</p>
            </div>
          </div>
        )}

        {/* Phone */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pastel-lavender flex items-center justify-center">
            <Phone className="w-5 h-5 text-pastel-purple" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="text-sm font-medium text-gray-900">{phone}</p>
          </div>
        </div>

        {/* Room Info */}
        {roomNumber && (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pastel-lavender flex items-center justify-center">
                <Home className="w-5 h-5 text-pastel-purple" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Room Number</p>
                <p className="text-sm font-medium text-gray-900">{roomNumber}</p>
              </div>
            </div>

            {roomType && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pastel-lavender flex items-center justify-center">
                  <Building className="w-5 h-5 text-pastel-purple" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Room Type</p>
                  <p className="text-sm font-medium text-gray-900">{roomType}</p>
                </div>
              </div>
            )}

            {floor && (
              <div className="ml-13">
                <p className="text-xs text-gray-500">Floor</p>
                <p className="text-sm font-medium text-gray-900">Floor {floor}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
