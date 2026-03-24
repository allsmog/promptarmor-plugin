import type { TargetConfig } from '../attacks/types.js';

export interface FormattedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface EndpointAdapter {
  formatRequest(prompt: string, config: TargetConfig): FormattedRequest;
  extractResponse(data: unknown): string;
}
