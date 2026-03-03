type ScoringInput = {
  website?: string | null;
  phone?: string | null;
  description?: string | null;
  coverageArea?: string | null;
};

export function baselineBusinessQualityScore(input: ScoringInput) {
  let score = 40;

  if (input.website && input.website.trim().length > 8) score += 15;
  if (input.phone && input.phone.trim().length >= 9) score += 15;
  if (input.description && input.description.trim().length >= 40) score += 20;
  if (input.coverageArea && input.coverageArea.trim().length >= 3) score += 10;

  return Math.min(100, Math.max(0, score));
}
