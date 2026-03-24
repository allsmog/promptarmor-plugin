/**
 * HTTP client for sending attack prompts to target endpoints.
 * Selects the appropriate EndpointAdapter based on TargetConfig.format.
 */

import type { TargetConfig } from '../attacks/types.js';
import type { EndpointAdapter } from './types.js';
import { RestJsonAdapter } from './rest-json.js';
import { OpenAICompatAdapter } from './openai-compat.js';
import { AnthropicCompatAdapter } from './anthropic-compat.js';

export type { EndpointAdapter, FormattedRequest } from './types.js';

const adapters: Record<string, EndpointAdapter> = {
  'rest-json': new RestJsonAdapter(),
  openai: new OpenAICompatAdapter(),
  anthropic: new AnthropicCompatAdapter(),
};

/**
 * Resolve the adapter for a given target config.
 */
export function getAdapter(config: TargetConfig): EndpointAdapter {
  const format = config.format ?? 'rest-json';
  const adapter = adapters[format];
  if (!adapter) {
    // For 'custom' or unknown formats, fall back to rest-json
    return adapters['rest-json'];
  }
  return adapter;
}

export interface SendResult {
  response: string;
  statusCode: number;
  duration: number;
}

/**
 * Send an attack prompt to the target endpoint and return the extracted response.
 */
export async function sendPrompt(
  prompt: string,
  config: TargetConfig,
): Promise<SendResult> {
  const adapter = getAdapter(config);
  const req = adapter.formatRequest(prompt, config);

  const start = performance.now();

  const fetchResponse = await fetch(req.url, {
    method: req.method,
    headers: req.headers,
    body: JSON.stringify(req.body),
    signal: AbortSignal.timeout(30_000),
  });

  const duration = performance.now() - start;

  let responseData: unknown;
  const contentType = fetchResponse.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    responseData = await fetchResponse.json();
  } else {
    responseData = await fetchResponse.text();
  }

  // If a custom responseField is specified, try to extract it
  let extracted: string;
  if (config.responseField && responseData && typeof responseData === 'object') {
    const obj = responseData as Record<string, unknown>;
    const fieldValue = getNestedField(obj, config.responseField);
    extracted = typeof fieldValue === 'string' ? fieldValue : JSON.stringify(fieldValue);
  } else {
    extracted = adapter.extractResponse(responseData);
  }

  return {
    response: extracted,
    statusCode: fetchResponse.status,
    duration,
  };
}

/**
 * Get a nested field from an object using dot notation (e.g. "data.response.text").
 */
function getNestedField(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
