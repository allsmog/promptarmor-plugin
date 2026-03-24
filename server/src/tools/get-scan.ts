/**
 * MCP Tool: prompt_armor_get_scan
 * Retrieves a specific scan result by ID.
 */

import type { StateStore } from '../state/store.js';
import type { ScanResult } from '../attacks/types.js';

export interface GetScanInput {
  scanId: string;
}

export interface GetScanOutput {
  found: boolean;
  scan?: {
    id: string;
    timestamp: string;
    target: string;
    status: string;
    result?: ScanResult;
    error?: string;
  };
}

export async function getScan(
  input: GetScanInput,
  store: StateStore,
): Promise<GetScanOutput> {
  const record = await store.loadScan(input.scanId);
  if (!record) {
    return { found: false };
  }

  return {
    found: true,
    scan: {
      id: record.id,
      timestamp: record.timestamp,
      target: record.target.url,
      status: record.status,
      result: record.result,
      error: record.error,
    },
  };
}
