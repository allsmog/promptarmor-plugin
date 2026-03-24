/**
 * MCP Tool: prompt_armor_configure_target
 * Validates and previews target endpoint configuration.
 */

import type { TargetConfig } from '../attacks/types.js';
import { getAdapter } from '../client/index.js';

export interface ConfigureTargetInput {
  url: string;
  format?: 'openai' | 'anthropic' | 'rest-json' | 'custom';
  method?: string;
  headers?: Record<string, string>;
  requestField?: string;
  responseField?: string;
}

export interface ConfigureTargetOutput {
  valid: boolean;
  config: TargetConfig;
  preview: {
    url: string;
    method: string;
    headers: Record<string, string>;
    sampleBody: unknown;
  };
  message: string;
}

export function configureTarget(input: ConfigureTargetInput): ConfigureTargetOutput {
  // Validate URL
  let validUrl = true;
  try {
    new URL(input.url);
  } catch {
    validUrl = false;
  }

  if (!validUrl) {
    return {
      valid: false,
      config: { url: input.url },
      preview: {
        url: input.url,
        method: input.method ?? 'POST',
        headers: {},
        sampleBody: null,
      },
      message: `Invalid URL: ${input.url}`,
    };
  }

  const config: TargetConfig = {
    url: input.url,
    format: input.format ?? 'rest-json',
    method: input.method,
    headers: input.headers,
    requestField: input.requestField,
    responseField: input.responseField,
  };

  const adapter = getAdapter(config);
  const sampleRequest = adapter.formatRequest('<SAMPLE_PROMPT>', config);

  return {
    valid: true,
    config,
    preview: {
      url: sampleRequest.url,
      method: sampleRequest.method,
      headers: sampleRequest.headers,
      sampleBody: sampleRequest.body,
    },
    message: `Target configuration is valid. Format: ${config.format ?? 'rest-json'}`,
  };
}
