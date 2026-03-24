/**
 * MCP Tool: prompt_armor_list_scans
 * Lists all scan records, newest first.
 */

import type { StateStore, ScanRecord } from '../state/store.js';

export interface ListScansInput {
  limit?: number;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

export interface ListScansOutput {
  scans: Array<{
    id: string;
    timestamp: string;
    target: string;
    status: string;
    total?: number;
    passed?: number;
    failed?: number;
  }>;
  total: number;
}

export async function listScans(
  input: ListScansInput,
  store: StateStore,
): Promise<ListScansOutput> {
  let records: ScanRecord[] = await store.listScans();

  if (input.status) {
    records = records.filter(r => r.status === input.status);
  }

  if (input.limit && input.limit > 0) {
    records = records.slice(0, input.limit);
  }

  return {
    scans: records.map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      target: r.target.url,
      status: r.status,
      total: r.result?.summary.total,
      passed: r.result?.summary.passed,
      failed: r.result?.summary.failed,
    })),
    total: records.length,
  };
}
