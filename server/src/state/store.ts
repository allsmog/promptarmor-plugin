/**
 * JSON file-based persistence in .prompt-armor/ directory.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { StateData, StateStore, ScanRecord } from './types.js';

export { type StateStore, type ScanRecord } from './types.js';

const STATE_DIR = '.prompt-armor';
const STATE_FILE = 'state.json';
const CURRENT_VERSION = 1;

function emptyState(): StateData {
  return { scans: {}, version: CURRENT_VERSION };
}

export class FileStateStore implements StateStore {
  private readonly dir: string;
  private readonly filePath: string;

  constructor(baseDir?: string) {
    this.dir = join(baseDir ?? process.cwd(), STATE_DIR);
    this.filePath = join(this.dir, STATE_FILE);
  }

  async init(): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    try {
      await readFile(this.filePath, 'utf-8');
    } catch {
      await this.writeState(emptyState());
    }
  }

  async saveScan(record: ScanRecord): Promise<void> {
    const state = await this.loadState();
    state.scans[record.id] = record;
    await this.writeState(state);
  }

  async loadScan(id: string): Promise<ScanRecord | undefined> {
    const state = await this.loadState();
    return state.scans[id];
  }

  async listScans(): Promise<ScanRecord[]> {
    const state = await this.loadState();
    return Object.values(state.scans).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  async deleteScan(id: string): Promise<boolean> {
    const state = await this.loadState();
    if (!(id in state.scans)) {
      return false;
    }
    delete state.scans[id];
    await this.writeState(state);
    return true;
  }

  async loadState(): Promise<StateData> {
    try {
      const raw = await readFile(this.filePath, 'utf-8');
      const data = JSON.parse(raw) as StateData;
      if (!data.scans || typeof data.version !== 'number') {
        return emptyState();
      }
      return data;
    } catch {
      return emptyState();
    }
  }

  private async writeState(state: StateData): Promise<void> {
    await writeFile(this.filePath, JSON.stringify(state, null, 2), 'utf-8');
  }
}

/**
 * Create a new file-based state store.
 */
export function createStore(baseDir?: string): StateStore {
  return new FileStateStore(baseDir);
}
