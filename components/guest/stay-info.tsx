'use client'

import { Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface StayInfoProps {
  checkInDate: Date
  checkOutDate: Date | null
  daysStayed: number
  daysRemaining: number | null
}

export function StayInfo({ checkInDate, checkOutDate, daysStayed, daysRemaining }: StayInfoProps) {
  return (
    <div className="bg-white rounded-[12px] p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-4">Stay Information</h2>

      <div className="space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#EBF3ED] flex items-center justify-center">
            <Calendar className="w-4 h-4 text-[#2D5A3D]" />
          </div>
          <div>
            <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide">Check-in</p>
            <p className="text-[14px] font-medium text-[#1C1C1C]">
              {format(new Date(checkInDate), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        {checkOutDate && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#FDF1F0] flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#B5403A]" />
            </div>
            <div>
              <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide">Check-out</p>
              <p className="text-[14px] font-medium text-[#1C1C1C]">
                {format(new Date(checkOutDate), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        )}

        {/* Duration */}
        <div className="bg-[#FAF9F6] rounded-[8px] p-3.5 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide mb-0.5">Days Stayed</p>
              <p className="text-[20px] font-bold text-[#1C1C1C]">{daysStayed}</p>
            </div>
            {daysRemaining !== null && (
              <div className="text-right">
                <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide mb-0.5">Remaining</p>
                <p className="text-[20px] font-bold text-[#2D5A3D]">{daysRemaining}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
