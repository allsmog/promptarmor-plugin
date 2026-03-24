/**
 * Anthropic-compatible endpoint adapter — formats requests for the /v1/messages API shape.
 */

import type { TargetConfig } from '../attacks/types.js';
import type { EndpointAdapter, FormattedRequest } from './types.js';

export class AnthropicCompatAdapter implements EndpointAdapter {
  formatRequest(prompt: string, config: TargetConfig): FormattedRequest {
    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        { role: 'user' as const, content: prompt },
      ],
    };

    return {
      url: config.url,
      method: config.method ?? 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
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
      // Standard Anthropic messages response
      if (Array.isArray(obj['content']) && obj['content'].length > 0) {
        const blocks = obj['content'] as Array<Record<string, unknown>>;
        const textBlocks = blocks
          .filter(b => b['type'] === 'text' && typeof b['text'] === 'string')
          .map(b => b['text'] as string);
        if (textBlocks.length > 0) {
          return textBlocks.join('\n');
        }
      }
      // Legacy completion response
      if (typeof obj['completion'] === 'string') {
        return obj['completion'] as string;
      }
    }
    return JSON.stringify(data);
  }
}
