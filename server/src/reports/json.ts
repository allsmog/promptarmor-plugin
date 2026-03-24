/**
 * JSON report generator.
 */

import type { ScanResult } from '../attacks/types.js';

export interface JsonReport {
  $schema: string;
  version: string;
  scan: ScanResult;
  generatedAt: string;
}

export function generateJsonReport(scan: ScanResult): string {
  const report: JsonReport = {
    $schema: 'https://promptarmor.dev/schemas/report-v1.json',
    version: '1.0.0',
    scan,
    generatedAt: new Date().toISOString(),
  };
  return JSON.stringify(report, null, 2);
}
