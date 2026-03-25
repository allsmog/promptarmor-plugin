import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createStore } from '../src/state/store.js';

describe('FileStateStore', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'pa-store-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('initializes with empty state', async () => {
    const store = createStore(dir);
    await store.init();
    const scans = await store.listScans();
    expect(scans).toEqual([]);
  });

  it('saves and retrieves a scan', async () => {
    const store = createStore(dir);
    await store.init();

    await store.saveScan({
      id: 'test-1',
      timestamp: '2026-01-01T00:00:00Z',
      target: { url: 'http://localhost:4010', format: 'rest-json' },
      status: 'completed',
    });

    const loaded = await store.loadScan('test-1');
    expect(loaded).toBeDefined();
    expect(loaded!.id).toBe('test-1');
    expect(loaded!.status).toBe('completed');
  });

  it('lists scans sorted by timestamp descending', async () => {
    const store = createStore(dir);
    await store.init();

    await store.saveScan({
      id: 'old',
      timestamp: '2026-01-01T00:00:00Z',
      target: { url: 'http://localhost:4010', format: 'rest-json' },
      status: 'completed',
    });
    await store.saveScan({
      id: 'new',
      timestamp: '2026-06-01T00:00:00Z',
      target: { url: 'http://localhost:4010', format: 'rest-json' },
      status: 'completed',
    });

    const scans = await store.listScans();
    expect(scans).toHaveLength(2);
    expect(scans[0].id).toBe('new');
    expect(scans[1].id).toBe('old');
  });

  it('deletes a scan', async () => {
    const store = createStore(dir);
    await store.init();

    await store.saveScan({
      id: 'to-delete',
      timestamp: '2026-01-01T00:00:00Z',
      target: { url: 'http://localhost:4010', format: 'rest-json' },
      status: 'completed',
    });

    const deleted = await store.deleteScan('to-delete');
    expect(deleted).toBe(true);
    const loaded = await store.loadScan('to-delete');
    expect(loaded).toBeUndefined();
  });

  it('returns false when deleting nonexistent scan', async () => {
    const store = createStore(dir);
    await store.init();
    const deleted = await store.deleteScan('nonexistent');
    expect(deleted).toBe(false);
  });

  it('survives corrupted state file', async () => {
    const store = createStore(dir);
    await store.init();

    // Corrupt the state file
    const { writeFile } = await import('node:fs/promises');
    await writeFile(join(dir, '.prompt-armor', 'state.json'), 'not json', 'utf-8');

    // Should recover with empty state
    const scans = await store.listScans();
    expect(scans).toEqual([]);
  });
});
