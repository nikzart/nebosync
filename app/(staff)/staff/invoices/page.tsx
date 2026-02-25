'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  FileText,
  Download,
  DollarSign,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckSquare,
  Square,
  XCircle,
  Check,
  Eye,
} from 'lucide-react'
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
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['all-invoices'],
    queryFn: async () => {
      const res = await fetch('/api/invoices')
      if (!res.ok) throw new Error('Failed to fetch invoices')
      return res.json()
    },
  })

  const downloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
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
    } catch {
      toast.error('Failed to download invoice')
    }
  }

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const previewInvoice = (invoiceId: string) => {
    setPreviewUrl(`/api/invoices/${invoiceId}/download?preview=true`)
  }

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

  const cancelInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (!res.ok) throw new Error('Failed to cancel invoice')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-invoices'] })
      toast.success('Invoice cancelled')
    },
    onError: () => {
      toast.error('Failed to cancel invoice')
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

  // Stats
  const totalCount = invoices?.length ?? 0
  const paidCount = invoices?.filter((inv) => inv.status === 'PAID').length ?? 0
  const pendingCount = invoices?.filter((inv) => inv.status === 'PENDING' || inv.status === 'DRAFT').length ?? 0
  const outstandingAmount = invoices
    ?.filter((inv) => inv.status === 'PENDING' || inv.status === 'DRAFT')
    .reduce((sum, inv) => sum + inv.total, 0) ?? 0
  const totalRevenue = invoices
    ?.filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.total, 0) ?? 0

  // Selection helpers
  const allFilteredSelected = filteredInvoices && filteredInvoices.length > 0 &&
    filteredInvoices.every((inv) => selectedIds.has(inv.id))

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (!filteredInvoices) return
    if (allFilteredSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredInvoices.map((inv) => inv.id)))
    }
  }

  // Bulk actions
  async function bulkMarkAsPaid() {
    if (!invoices) return
    const targets = invoices.filter(
      (inv) => selectedIds.has(inv.id) && (inv.status === 'PENDING' || inv.status === 'DRAFT')
    )
    if (targets.length === 0) {
      toast.error('No pending invoices selected')
      return
    }

    const results = await Promise.allSettled(
      targets.map((inv) =>
        fetch(`/api/invoices/${inv.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'PAID', paidAt: new Date().toISOString() }),
        })
      )
    )
    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    queryClient.invalidateQueries({ queryKey: ['all-invoices'] })
    setSelectedIds(new Set())
    if (failed === 0) {
      toast.success(`${succeeded} invoice${succeeded !== 1 ? 's' : ''} marked as paid`)
    } else {
      toast.error(`${succeeded} succeeded, ${failed} failed`)
    }
  }

  async function bulkDownload() {
    if (!invoices) return
    const targets = invoices.filter((inv) => selectedIds.has(inv.id))
    if (targets.length === 0) return

    toast.info(`Downloading ${targets.length} invoice${targets.length !== 1 ? 's' : ''}...`)
    for (const inv of targets) {
      await downloadInvoice(inv.id, inv.invoiceNumber)
      // Small delay between downloads
      await new Promise((r) => setTimeout(r, 500))
    }
    setSelectedIds(new Set())
  }

  async function bulkCancel() {
    if (!invoices) return
    const targets = invoices.filter(
      (inv) => selectedIds.has(inv.id) && (inv.status === 'PENDING' || inv.status === 'DRAFT')
    )
    if (targets.length === 0) {
      toast.error('No pending invoices selected')
      return
    }
    if (!confirm(`Cancel ${targets.length} invoice${targets.length !== 1 ? 's' : ''}?`)) return

    const results = await Promise.allSettled(
      targets.map((inv) =>
        fetch(`/api/invoices/${inv.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'CANCELLED' }),
        })
      )
    )
    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    queryClient.invalidateQueries({ queryKey: ['all-invoices'] })
    setSelectedIds(new Set())
    if (failed === 0) {
      toast.success(`${succeeded} invoice${succeeded !== 1 ? 's' : ''} cancelled`)
    } else {
      toast.error(`${succeeded} succeeded, ${failed} failed`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
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

      {/* Summary Cards */}
      {invoices && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold">{totalCount}</p>
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
                  <p className="text-2xl font-bold text-green-600">{paidCount}</p>
                </div>
                <Check className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{outstandingAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        {/* Select All checkbox */}
        {filteredInvoices && filteredInvoices.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {allFilteredSelected ? (
              <CheckSquare className="w-5 h-5 text-primary" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            Select All
          </button>
        )}

        <div className="relative flex-1 min-w-[200px]">
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
          {['ALL', 'PENDING', 'PAID', 'CANCELLED'].map((status) => (
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

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg"
          >
            <span className="text-sm font-medium">
              {selectedIds.size} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" onClick={bulkMarkAsPaid}>
                <Check className="w-4 h-4 mr-1" />
                Mark as Paid
              </Button>
              <Button size="sm" variant="outline" onClick={bulkDownload}>
                <Download className="w-4 h-4 mr-1" />
                Download All
              </Button>
              <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={bulkCancel}>
                <XCircle className="w-4 h-4 mr-1" />
                Cancel Selected
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          {filteredInvoices.map((invoice, index) => {
            const isExpanded = expandedInvoiceId === invoice.id
            const isSelected = selectedIds.has(invoice.id)

            return (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-primary/40' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelect(invoice.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>

                      {/* Main content — clickable to expand */}
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => setExpandedInvoiceId(isExpanded ? null : invoice.id)}
                      >
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
                                  <span>&middot;</span>
                                  <span>{invoice.guest.phone}</span>
                                  {invoice.guest.room && (
                                    <>
                                      <span>&middot;</span>
                                      <span>Room {invoice.guest.room.roomNumber}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="text-sm font-medium">
                                  {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                                </p>
                              </div>
                              {invoice.paidAt && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Paid</p>
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
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                                  invoice.status
                                )}`}
                              >
                                {invoice.status}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
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
                                onClick={(e) => {
                                  e.stopPropagation()
                                  previewInvoice(invoice.id)
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  downloadInvoice(invoice.id, invoice.invoiceNumber)
                                }}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                              {invoice.status === 'PENDING' && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markAsPaidMutation.mutate(invoice.id)
                                  }}
                                  disabled={markAsPaidMutation.isPending}
                                >
                                  Mark as Paid
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Detail Section */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 pt-6 border-t space-y-6">
                            {/* Line Items Table */}
                            <div>
                              <h4 className="text-sm font-semibold mb-3">Line Items</h4>
                              <div className="rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-muted/50">
                                      <th className="text-left px-4 py-2 font-medium">Description</th>
                                      <th className="text-right px-4 py-2 font-medium">Qty</th>
                                      <th className="text-right px-4 py-2 font-medium">Unit Price</th>
                                      <th className="text-right px-4 py-2 font-medium">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {invoice.invoiceItems.map((item) => (
                                      <tr key={item.id} className="border-t">
                                        <td className="px-4 py-2">{item.description}</td>
                                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                                        <td className="px-4 py-2 text-right">
                                          ₹{item.unitPrice.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 py-2 text-right font-medium">
                                          ₹{item.total.toLocaleString('en-IN')}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Amount Breakdown + Guest Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Guest Info */}
                              <div className="p-4 bg-muted/30 rounded-lg">
                                <h4 className="text-sm font-semibold mb-3">Guest Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Name</span>
                                    <span className="font-medium">{invoice.guest.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phone</span>
                                    <span className="font-medium">{invoice.guest.phone}</span>
                                  </div>
                                  {invoice.guest.email && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Email</span>
                                      <span className="font-medium">{invoice.guest.email}</span>
                                    </div>
                                  )}
                                  {invoice.guest.room && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Room</span>
                                      <span className="font-medium">{invoice.guest.room.roomNumber}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Amount Breakdown */}
                              <div className="p-4 bg-muted/30 rounded-lg">
                                <h4 className="text-sm font-semibold mb-3">Amount Breakdown</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">
                                      ₹{invoice.subtotal.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span className="font-medium">
                                      ₹{invoice.tax.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-t pt-2 mt-2">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-bold text-primary">
                                      ₹{invoice.total.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </div>

                                {/* Payment Status */}
                                <div className="mt-4 pt-3 border-t space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(invoice.status)}`}>
                                      {invoice.status}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created</span>
                                    <span className="font-medium">
                                      {format(new Date(invoice.createdAt), 'MMM dd, yyyy h:mm a')}
                                    </span>
                                  </div>
                                  {invoice.paidAt && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Paid</span>
                                      <span className="font-medium">
                                        {format(new Date(invoice.paidAt), 'MMM dd, yyyy h:mm a')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Cancel button for pending invoices */}
                            {(invoice.status === 'PENDING' || invoice.status === 'DRAFT') && (
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    if (confirm(`Cancel invoice #${invoice.invoiceNumber}?`)) {
                                      cancelInvoiceMutation.mutate(invoice.id)
                                    }
                                  }}
                                  disabled={cancelInvoiceMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Cancel Invoice
                                </Button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
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

      {/* Invoice Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative w-full max-w-3xl h-[85vh] bg-card rounded-2xl overflow-hidden shadow-2xl border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <span className="text-sm font-semibold">Invoice Preview</span>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none px-2"
              >
                &times;
              </button>
            </div>
            <iframe
              src={previewUrl}
              className="w-full"
              style={{ height: 'calc(85vh - 49px)' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
