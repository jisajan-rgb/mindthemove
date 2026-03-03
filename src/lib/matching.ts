import { Business, BusinessStatus, Lead } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function postcodeArea(postcode: string) {
  const cleaned = postcode.trim().toUpperCase();
  return cleaned.split(" ")[0]?.replace(/[0-9].*$/, "") || cleaned;
}

function serviceMatchScore(leadService: string, businessService: string) {
  const a = normalize(leadService);
  const b = normalize(businessService);
  if (a === b) return 60;
  if (a.includes(b) || b.includes(a)) return 45;

  const leadTokens = new Set(a.split(/\W+/).filter(Boolean));
  const bizTokens = new Set(b.split(/\W+/).filter(Boolean));
  const overlap = [...leadTokens].filter((t) => bizTokens.has(t)).length;
  return overlap > 0 ? 30 : 0;
}

function coverageScore(leadPostcode: string, coverageArea: string) {
  const area = postcodeArea(leadPostcode);
  const coverage = normalize(coverageArea);
  if (coverage.includes(normalize(area))) return 25;
  if (coverage.includes("bristol")) return 15;
  return 0;
}

export async function findBestBusinessMatch(lead: Lead) {
  const businesses = await prisma.business.findMany({
    where: { status: BusinessStatus.APPROVED },
    orderBy: { updatedAt: "desc" },
  });

  let best: { business: Business; score: number } | null = null;

  for (const business of businesses) {
    const score =
      serviceMatchScore(lead.serviceNeeded, business.service) +
      coverageScore(lead.postcode, business.coverageArea) +
      Math.round((business.qualityScore || 50) * 0.15);

    if (!best || score > best.score) {
      best = { business, score };
    }
  }

  if (!best || best.score < 55) return null;
  return best;
}
