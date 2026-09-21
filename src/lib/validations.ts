import type { Prisma } from "@prisma/client";
import { z } from "zod";

export const regulatorSchema = z.enum(["SRA", "CLC"]);
export const citySchema = z.enum(["BRISTOL"]);

const isoDateSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid datetime");

const bristolOutwardSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^BS\d{1,2}$/, "Phase 1 listings must use Bristol (BS) outward codes");

export const firmWriteSchema = z.object({
  name: z.string().trim().min(1).max(200),
  regulator: regulatorSchema,
  regulatorNumber: z.string().trim().min(1).max(32),
  listed: z.boolean().optional().default(false),
  clientMoneyOk: z.boolean().optional().default(false),
  diligenceNotes: z.string().trim().max(8000).nullable().optional(),
  diligencePassedAt: isoDateSchema.nullable().optional(),
});

export const firmPatchSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  regulator: regulatorSchema.optional(),
  regulatorNumber: z.string().trim().min(1).max(32).optional(),
  listed: z.boolean().optional(),
  clientMoneyOk: z.boolean().optional(),
  diligenceNotes: z.string().trim().max(8000).nullable().optional(),
  diligencePassedAt: isoDateSchema.nullable().optional(),
});

export const listingWriteSchema = z.object({
  firmId: z.string().uuid(),
  city: citySchema.optional().default("BRISTOL"),
  postcodeOutwardCodes: z.array(bristolOutwardSchema).optional().default([]),
  active: z.boolean().optional().default(false),
});

export const listingPatchSchema = z.object({
  firmId: z.string().uuid().optional(),
  city: citySchema.optional(),
  postcodeOutwardCodes: z.array(bristolOutwardSchema).optional(),
  active: z.boolean().optional(),
});

export const waitlistMoveIntentSchema = z.enum([
  "BUYING",
  "SELLING",
  "BOTH",
  "NOT_SURE",
]);

export const waitlistWriteSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(120),
  area: z.string().trim().min(1).max(120),
  moveIntent: waitlistMoveIntentSchema,
  timeline: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
  consent: z.literal(true),
});

export type FirmWriteInput = z.infer<typeof firmWriteSchema>;
export type FirmPatchInput = z.infer<typeof firmPatchSchema>;
export type ListingWriteInput = z.infer<typeof listingWriteSchema>;
export type ListingPatchInput = z.infer<typeof listingPatchSchema>;
export type WaitlistWriteInput = z.infer<typeof waitlistWriteSchema>;

export function parseDiligenceAt(
  value: string | null | undefined,
): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return new Date(value);
}

export function assertFirmCanBeListed(input: {
  listed?: boolean;
  diligencePassedAt?: Date | null;
}): string | null {
  if (input.listed && !input.diligencePassedAt) {
    return "O9: a firm cannot be listed until diligencePassedAt is set. A regulator number alone is not enough.";
  }
  return null;
}

export function assertListingCanBeActive(
  firm: { listed: boolean; diligencePassedAt: Date | null } | null,
  active: boolean,
): string | null {
  if (!active) return null;
  if (!firm) return "Firm not found";
  if (!firm.listed || !firm.diligencePassedAt) {
    return "O9: an active listing requires the firm to be listed with diligencePassedAt set.";
  }
  return null;
}

export function publicDirectoryWhere(): Prisma.ListingWhereInput {
  return {
    active: true,
    city: "BRISTOL",
    firm: {
      listed: true,
      diligencePassedAt: { not: null },
      // Soft-test lock: do not render the seed authorised firm on consumer pages.
      NOT: {
        regulator: "SRA",
        regulatorNumber: "633024",
      },
    },
  };
}
