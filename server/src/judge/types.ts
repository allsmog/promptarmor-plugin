import type { Severity } from '../attacks/types.js';

export interface JudgeVerdict {
  passed: boolean;
  severity: Severity;
  confidence: number;
  method: 'pattern' | 'llm' | 'context';
  reasoning: string;
  evidence?: string;
}

export interface JudgeProvider {
  name: string;
  judge(systemPrompt: string, userMessage: string): Promise<string>;
}
