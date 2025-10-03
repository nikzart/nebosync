'use client'

import { Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface StayInfoProps {
  checkInDate: Date
  checkOutDate: Date | null
  daysStayed: number
  daysRemaining: number | null
}

export function StayInfo({ checkInDate, checkOutDate, daysStayed, daysRemaining }: StayInfoProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Stay Information</h2>

      <div className="space-y-4">
        {/* Check-in Date */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Check-in</p>
            <p className="text-sm font-medium text-gray-900">
              {format(new Date(checkInDate), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        {/* Check-out Date */}
        {checkOutDate && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Check-out</p>
              <p className="text-sm font-medium text-gray-900">
                {format(new Date(checkOutDate), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        )}

        {/* Stay Duration */}
        <div className="bg-gradient-to-r from-pastel-purple/10 to-pastel-lavender/10 rounded-2xl p-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Days Stayed</p>
              <p className="text-2xl font-bold text-gray-900">{daysStayed}</p>
            </div>
            {daysRemaining !== null && (
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Days Remaining</p>
                <p className="text-2xl font-bold text-pastel-purple">{daysRemaining}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
