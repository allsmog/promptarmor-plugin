/**
 * Report orchestrator — delegates to format-specific generators.
 */

import type { ScanResult } from '../attacks/types.js';
import { generateTextReport } from './text.js';
import { generateJsonReport } from './json.js';
import { generateSarifReport } from './sarif.js';

export type ReportFormat = 'text' | 'json' | 'sarif';

export { generateTextReport } from './text.js';
export { generateJsonReport } from './json.js';
export { generateSarifReport } from './sarif.js';

/**
 * Generate a report in the specified format.
 */
export function generateReport(scan: ScanResult, format: ReportFormat): string {
  switch (format) {
    case 'text':
      return generateTextReport(scan);
    case 'json':
      return generateJsonReport(scan);
    case 'sarif':
      return generateSarifReport(scan);
    default:
      throw new Error(`Unsupported report format: ${format as string}`);
  }
}
