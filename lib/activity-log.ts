import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

type ActivityAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE'

interface LogActivityParams {
  userId?: string | null
  action: ActivityAction
  entity: string
  entityId?: string
  description: string
  metadata?: Prisma.InputJsonValue
}

/**
 * Fire-and-forget activity logger. Never awaited, never throws.
 * Safe to call after any mutation without affecting the caller.
 */
export function logActivity(params: LogActivityParams): void {
  prisma.activityLog
    .create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        description: params.description,
        metadata: params.metadata ?? undefined,
      },
    })
    .catch((error) => {
      console.error('Failed to log activity:', error)
    })
}
