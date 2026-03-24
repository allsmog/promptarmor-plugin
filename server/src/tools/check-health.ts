/**
 * MCP Tool: prompt_armor_check_health
 * Verifies connectivity to a target endpoint and reports server status.
 */

import type { TargetConfig } from '../attacks/types.js';
import { sendPrompt } from '../client/index.js';
import type { StateStore } from '../state/store.js';

export interface CheckHealthInput {
  url?: string;
  format?: 'openai' | 'anthropic' | 'rest-json' | 'custom';
  headers?: Record<string, string>;
}

export interface CheckHealthOutput {
  server: {
    status: 'ok';
    version: string;
    uptime: number;
  };
  target?: {
    reachable: boolean;
    statusCode?: number;
    latency?: number;
    error?: string;
  };
  store: {
    available: boolean;
    scanCount: number;
  };
}

const startTime = Date.now();

export async function checkHealth(
  input: CheckHealthInput,
  store: StateStore,
): Promise<CheckHealthOutput> {
  const output: CheckHealthOutput = {
    server: {
      status: 'ok',
      version: '1.0.0',
      uptime: Date.now() - startTime,
    },
    store: {
      available: false,
      scanCount: 0,
    },
  };

  // Check store health
  try {
    const scans = await store.listScans();
    output.store = {
      available: true,
      scanCount: scans.length,
    };
  } catch {
    output.store = {
      available: false,
      scanCount: 0,
    };
  }

  // Check target health if URL provided
  if (input.url) {
    const config: TargetConfig = {
      url: input.url,
      format: input.format ?? 'rest-json',
      headers: input.headers,
    };

    try {
      const result = await sendPrompt('Hello, this is a health check.', config);
      output.target = {
        reachable: true,
        statusCode: result.statusCode,
        latency: Math.round(result.duration),
      };
    } catch (err) {
      output.target = {
        reachable: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return output;
}
