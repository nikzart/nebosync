'use client'

import { ShoppingBag, MessageCircle, FileText, TrendingUp } from 'lucide-react'

interface ActivityStatsProps {
  totalOrders: number
  activeOrders: number
  totalSpent: number
  totalMessages: number
  totalInvoices: number
}

export function ActivityStats({
  totalOrders,
  activeOrders,
  totalSpent,
  totalMessages,
  totalInvoices,
}: ActivityStatsProps) {
  return (
    <div className="bg-white rounded-[12px] p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <h2 className="text-[16px] font-semibold text-[#1C1C1C] mb-4">Activity</h2>

      {/* Total Spending */}
      <div className="bg-[#FAF9F6] rounded-[8px] p-3.5 mb-3 border border-[#C9A96E]/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] text-[#6B6B6B] mb-0.5">Total Spending</p>
            <p className="text-[24px] font-bold text-[#1C1C1C] tabular-nums">
              ₹{totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-[8px] bg-[#F5F0E4] flex items-center justify-center">
            <span className="text-[16px] font-bold text-[#C9A96E]">₹</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#FAF9F6] rounded-[8px] p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-[#2D5A3D]" />
            <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide">Orders</p>
          </div>
          <p className="text-[20px] font-bold text-[#1C1C1C]">{totalOrders}</p>
        </div>

        <div className="bg-[#FAF9F6] rounded-[8px] p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#C9A96E]" />
            <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide">Active</p>
          </div>
          <p className="text-[20px] font-bold text-[#C9A96E]">{activeOrders}</p>
        </div>

        <div className="bg-[#FAF9F6] rounded-[8px] p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-[#2D5A3D]" />
            <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide">Messages</p>
          </div>
          <p className="text-[20px] font-bold text-[#1C1C1C]">{totalMessages}</p>
        </div>

        <div className="bg-[#FAF9F6] rounded-[8px] p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-[#2D5A3D]" />
            <p className="text-[11px] text-[#A1A1A1] uppercase tracking-wide">Invoices</p>
          </div>
          <p className="text-[20px] font-bold text-[#1C1C1C]">{totalInvoices}</p>
        </div>
      </div>
    </div>
  )
}
