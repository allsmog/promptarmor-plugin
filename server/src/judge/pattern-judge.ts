/**
 * Pattern-based judge — case-insensitive substring matching against known indicators.
 * Port of the Go detect.Check function.
 */

export interface PatternCheckResult {
  matched: boolean;
  indicator: string;
}

export function patternCheck(
  response: string,
  indicators: string[],
): PatternCheckResult {
  const lower = response.toLowerCase();
  for (const ind of indicators) {
    if (lower.includes(ind.toLowerCase())) {
      return { matched: true, indicator: ind };
    }
  }
  return { matched: false, indicator: '' };
}
