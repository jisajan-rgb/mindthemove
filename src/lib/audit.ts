import type { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

type AuditInput = {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
};

export async function writeAuditLog(
  prisma: PrismaClient,
  input: AuditInput,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });
}
