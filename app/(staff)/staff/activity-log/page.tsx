'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  User,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityLogEntry {
  id: string
  userId: string | null
  action: string
  entity: string
  entityId: string | null
  description: string
  metadata: Record<string, unknown> | null
  createdAt: string
  user: {
    id: string
    name: string
    role: string
  } | null
}

interface ActivityLogResponse {
  logs: ActivityLogEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const ACTION_CONFIG: Record<string, { icon: typeof Plus; color: string; bgColor: string }> = {
  CREATE: { icon: Plus, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  UPDATE: { icon: Pencil, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  DELETE: { icon: Trash2, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  STATUS_CHANGE: { icon: ArrowRight, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
}

const ENTITY_OPTIONS = [
  { value: '', label: 'All Entities' },
  { value: 'order', label: 'Orders' },
  { value: 'guest', label: 'Guests' },
  { value: 'user', label: 'Staff' },
  { value: 'food_menu', label: 'Food Menu' },
  { value: 'service', label: 'Services' },
  { value: 'hotel_settings', label: 'Settings' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'invoice', label: 'Invoices' },
]

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'STATUS_CHANGE', label: 'Status Change' },
]

export default function ActivityLogPage() {
  const [page, setPage] = useState(1)
  const [entity, setEntity] = useState('')
  const [action, setAction] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data, isLoading } = useQuery<ActivityLogResponse>({
    queryKey: ['activity-logs', page, entity, action, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (entity) params.set('entity', entity)
      if (action) params.set('action', action)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const res = await fetch(`/api/activity-logs?${params}`)
      if (!res.ok) throw new Error('Failed to fetch activity logs')
      return res.json()
    },
  })

  // Reset page when filters change
  function updateFilter(setter: (v: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Activity Log</h1>
        <p className="text-muted-foreground">Track all actions performed by staff members</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={entity}
              onChange={(e) => updateFilter(setEntity, e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              {ENTITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={action}
              onChange={(e) => updateFilter(setAction, e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">From:</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => updateFilter(setDateFrom, e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">To:</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => updateFilter(setDateTo, e.target.value)}
                className="w-auto"
              />
            </div>
            {(entity || action || dateFrom || dateTo) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEntity('')
                  setAction('')
                  setDateFrom('')
                  setDateTo('')
                  setPage(1)
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Timeline
            {data && (
              <span className="text-sm font-normal text-muted-foreground">
                ({data.total} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading activity logs...
            </div>
          ) : data?.logs && data.logs.length > 0 ? (
            <div className="space-y-1">
              {data.logs.map((log) => {
                const config = ACTION_CONFIG[log.action] ?? ACTION_CONFIG.UPDATE
                const Icon = config.icon
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {log.user && (
                          <span className="inline-flex items-center gap-1 text-sm font-medium">
                            <User className="w-3 h-3" />
                            {log.user.name}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                          {log.action}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {log.entity}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-1">{log.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">No activity logs yet</h2>
              <p className="text-muted-foreground">
                Activity will appear here as staff perform actions
              </p>
            </div>
          )}

          {/* Load More */}
          {data && data.page < data.totalPages && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
              >
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
