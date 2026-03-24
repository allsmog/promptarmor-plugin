import type { ScanResult, TargetConfig } from '../attacks/types.js';

export interface ScanRecord {
  id: string;
  timestamp: string;
  target: TargetConfig;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: ScanResult;
  error?: string;
}

export interface StateData {
  scans: Record<string, ScanRecord>;
  version: number;
}

export interface StateStore {
  /** Initialize the store (create directory/file if needed). */
  init(): Promise<void>;
  /** Save a scan record. */
  saveScan(record: ScanRecord): Promise<void>;
  /** Load a scan record by ID. */
  loadScan(id: string): Promise<ScanRecord | undefined>;
  /** List all scan records, newest first. */
  listScans(): Promise<ScanRecord[]>;
  /** Delete a scan record by ID. */
  deleteScan(id: string): Promise<boolean>;
  /** Load the full state. */
  loadState(): Promise<StateData>;
}
