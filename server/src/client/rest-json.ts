/**
 * REST JSON endpoint adapter — sends prompts as a configurable JSON field.
 */

import type { TargetConfig } from '../attacks/types.js';
import type { EndpointAdapter, FormattedRequest } from './types.js';

export class RestJsonAdapter implements EndpointAdapter {
  formatRequest(prompt: string, config: TargetConfig): FormattedRequest {
    const requestField = config.requestField ?? 'prompt';
    const body: Record<string, unknown> = { [requestField]: prompt };

    return {
      url: config.url,
      method: config.method ?? 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body,
    };
  }

  extractResponse(data: unknown): string {
    if (typeof data === 'string') {
      return data;
    }
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      // Try common response field names
      for (const field of ['response', 'text', 'output', 'result', 'message', 'content', 'answer']) {
        if (typeof obj[field] === 'string') {
          return obj[field] as string;
        }
      }
      // Try nested structures
      if (obj['data'] && typeof obj['data'] === 'object') {
        const nested = obj['data'] as Record<string, unknown>;
        for (const field of ['response', 'text', 'output', 'result', 'message', 'content']) {
          if (typeof nested[field] === 'string') {
            return nested[field] as string;
          }
        }
      }
    }
    return JSON.stringify(data);
  }
}
