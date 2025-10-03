'use client'

import { ShoppingBag, DollarSign, MessageCircle, FileText, TrendingUp } from 'lucide-react'

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
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity & Statistics</h2>

      {/* Total Spending - Featured */}
      <div className="bg-gradient-to-br from-lime-accent/20 to-lime-accent/10 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Spending</p>
            <p className="text-3xl font-bold text-gray-900">
              ₹{totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-lime-accent flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-black" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Orders */}
        <div className="bg-pastel-lavender/30 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4 text-pastel-purple" />
            <p className="text-xs text-gray-600">Total Orders</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
        </div>

        {/* Active Orders */}
        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-gray-600">Active</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">{activeOrders}</p>
        </div>

        {/* Messages */}
        <div className="bg-purple-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-purple-600" />
            <p className="text-xs text-gray-600">Messages</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{totalMessages}</p>
        </div>

        {/* Invoices */}
        <div className="bg-orange-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-orange-600" />
            <p className="text-xs text-gray-600">Invoices</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{totalInvoices}</p>
        </div>
      </div>
    </div>
  )
}
