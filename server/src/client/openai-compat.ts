/**
 * OpenAI-compatible endpoint adapter — formats requests for the /v1/chat/completions API shape.
 */

import type { TargetConfig } from '../attacks/types.js';
import type { EndpointAdapter, FormattedRequest } from './types.js';

export class OpenAICompatAdapter implements EndpointAdapter {
  formatRequest(prompt: string, config: TargetConfig): FormattedRequest {
    const body = {
      model: 'gpt-4',
      messages: [
        { role: 'user' as const, content: prompt },
      ],
      max_tokens: 2048,
      temperature: 0,
    };

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
      // Standard OpenAI chat completion response
      if (Array.isArray(obj['choices']) && obj['choices'].length > 0) {
        const choice = obj['choices'][0] as Record<string, unknown>;
        if (choice['message'] && typeof choice['message'] === 'object') {
          const message = choice['message'] as Record<string, unknown>;
          if (typeof message['content'] === 'string') {
            return message['content'] as string;
          }
        }
        // Some APIs return text directly in choice
        if (typeof choice['text'] === 'string') {
          return choice['text'] as string;
        }
      }
      // Fallback: try content directly
      if (typeof obj['content'] === 'string') {
        return obj['content'] as string;
      }
    }
    return JSON.stringify(data);
  }
}
