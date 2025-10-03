'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, FileText, Download, DollarSign, Calendar, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Invoice {
  id: string
  invoiceNumber: string
  subtotal: number
  tax: number
  total: number
  status: string
  createdAt: string
  paidAt: string | null
  guest: {
    id: string
    name: string
    phone: string
    email: string | null
    room: {
      roomNumber: string
    } | null
  }
  invoiceItems: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
    order?: {
      id: string
      orderType: string
      orderItems: Array<{
        id: string
        quantity: number
        price: number
        subtotal: number
        service?: {
          name: string
        } | null
        foodMenu?: {
          name: string
        } | null
      }>
    } | null
  }>
}

export default function InvoicesPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['all-invoices'],
    queryFn: async () => {
      const res = await fetch('/api/invoices')
      if (!res.ok) throw new Error('Failed to fetch invoices')
      return res.json()
    },
  })

  const downloadInvoiceMutation = useMutation({
    mutationFn: async ({ invoiceId, invoiceNumber }: { invoiceId: string; invoiceNumber: string }) => {
      const res = await fetch(`/api/invoices/${invoiceId}/download`)
      if (!res.ok) throw new Error('Failed to download invoice')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },
    onSuccess: () => {
      toast.success('Invoice downloaded successfully')
    },
    onError: () => {
      toast.error('Failed to download invoice')
    },
  })

  const markAsPaidMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID', paidAt: new Date().toISOString() }),
      })
      if (!res.ok) throw new Error('Failed to update invoice')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-invoices'] })
      toast.success('Invoice marked as paid')
    },
    onError: () => {
      toast.error('Failed to update invoice')
    },
  })

  const filteredInvoices = invoices?.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.guest.phone.includes(searchQuery)

    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'OVERDUE':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Invoices & Billing</h1>
        <p className="text-muted-foreground">
          Manage and track guest invoices
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by invoice number, guest name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              size="sm"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {invoices && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold">{invoices.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    {invoices.filter((inv) => inv.status === 'PAID').length}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {invoices.filter((inv) => inv.status === 'PENDING').length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ₹{invoices
                      .filter((inv) => inv.status === 'PAID')
                      .reduce((sum, inv) => sum + inv.total, 0)
                      .toLocaleString('en-IN')}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoices List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredInvoices && filteredInvoices.length > 0 ? (
        <div className="space-y-4">
          {filteredInvoices.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            Invoice #{invoice.invoiceNumber}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>{invoice.guest.name}</span>
                            <span>•</span>
                            <span>{invoice.guest.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Invoice Details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Created Date</p>
                          <p className="text-sm font-medium">
                            {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        {invoice.paidAt && (
                          <div>
                            <p className="text-xs text-muted-foreground">Paid Date</p>
                            <p className="text-sm font-medium">
                              {format(new Date(invoice.paidAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground">Items</p>
                          <p className="text-sm font-medium">
                            {invoice.invoiceItems.length} item(s)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex flex-col items-end gap-3 ml-4">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-2xl font-bold text-primary">
                          ₹{invoice.total.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadInvoiceMutation.mutate({
                            invoiceId: invoice.id,
                            invoiceNumber: invoice.invoiceNumber
                          })}
                          disabled={downloadInvoiceMutation.isPending}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        {invoice.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => markAsPaidMutation.mutate(invoice.id)}
                            disabled={markAsPaidMutation.isPending}
                          >
                            Mark as Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No invoices found</h2>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No invoices match your filters'
                : 'No invoices have been generated yet'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
