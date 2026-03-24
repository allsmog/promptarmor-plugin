/**
 * MCP Tool: prompt_armor_delete_scan
 * Deletes a scan record by ID.
 */

import type { StateStore } from '../state/store.js';

export interface DeleteScanInput {
  scanId: string;
}

export interface DeleteScanOutput {
  deleted: boolean;
  message: string;
}

export async function deleteScan(
  input: DeleteScanInput,
  store: StateStore,
): Promise<DeleteScanOutput> {
  const deleted = await store.deleteScan(input.scanId);
  return {
    deleted,
    message: deleted
      ? `Scan ${input.scanId} deleted successfully`
      : `Scan ${input.scanId} not found`,
  };
}
