export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type AttackCategory =
  | 'jailbreak' | 'injection' | 'tool-abuse' | 'harmful'
  | 'bias' | 'pii' | 'compliance' | 'agentic' | 'rag' | 'other';

export interface AttackCase {
  prompt: string;
  indicators: string[];
  metadata?: Record<string, unknown>;
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

export interface TargetConfig {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  format?: 'openai' | 'anthropic' | 'rest-json' | 'custom';
  requestField?: string;
  responseField?: string;
}

export interface AttackContext {
  systemPrompt?: string;
  toolSchemas?: ToolSchema[];
  guardrails?: string[];
  targetDescription?: string;
  target: TargetConfig;
  numVariants?: number;
}

export interface GradingCriteria {
  passDescription: string;
  failDescription: string;
  rubric?: string;
}

export interface AttackPlugin {
  id: string;
  category: AttackCategory;
  name: string;
  description: string;
  severity: Severity;
  owasp?: string;
  generatePrompts(ctx: AttackContext): Promise<AttackCase[]>;
  getGradingCriteria(): GradingCriteria;
  getIndicators(): string[];
  compatibleMutations?: string[];
  excludedMutations?: string[];
}

export interface AttackResult {
  attackId: string;
  category: AttackCategory;
  prompt: string;
  response: string;
  passed: boolean;
  severity: Severity;
  confidence: number;
  method: 'pattern' | 'llm' | 'context';
  reasoning: string;
  evidence?: string;
  mutation?: string;
  duration: number;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  target: TargetConfig;
  results: AttackResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    bySeverity: Record<Severity, number>;
    byCategory: Record<string, { passed: number; failed: number }>;
  };
  duration: number;
}
