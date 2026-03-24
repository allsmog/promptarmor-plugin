/**
 * Zod schema for promptarmor.yaml configuration.
 */

import { z } from 'zod';

export const SeveritySchema = z.enum(['critical', 'high', 'medium', 'low']);

export const AttackCategorySchema = z.enum([
  'jailbreak', 'injection', 'tool-abuse', 'harmful',
  'bias', 'pii', 'compliance', 'agentic', 'rag', 'other',
]);

export const TargetConfigSchema = z.object({
  url: z.string().url(),
  method: z.string().default('POST'),
  headers: z.record(z.string()).optional(),
  format: z.enum(['openai', 'anthropic', 'rest-json', 'custom']).default('rest-json'),
  requestField: z.string().optional(),
  responseField: z.string().optional(),
});

export const ToolSchemaSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.unknown()).optional(),
});

export const JudgeConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'custom']).optional(),
  model: z.string().optional(),
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
});

export const ScanConfigSchema = z.object({
  categories: z.array(AttackCategorySchema).optional(),
  severity: z.array(SeveritySchema).optional(),
  concurrency: z.number().int().min(1).max(50).default(5),
  timeout: z.number().int().min(1000).default(30000),
  numVariants: z.number().int().min(1).max(100).default(5),
  mutations: z.array(z.string()).optional(),
  excludeMutations: z.array(z.string()).optional(),
});

export const PromptArmorConfigSchema = z.object({
  version: z.string().default('1.0'),
  target: TargetConfigSchema,
  systemPrompt: z.string().optional(),
  toolSchemas: z.array(ToolSchemaSchema).optional(),
  guardrails: z.array(z.string()).optional(),
  targetDescription: z.string().optional(),
  scan: ScanConfigSchema.optional(),
  judge: JudgeConfigSchema.optional(),
  reportFormats: z.array(z.enum(['text', 'json', 'sarif'])).default(['text']),
  outputDir: z.string().default('.prompt-armor/reports'),
});

export type PromptArmorConfig = z.infer<typeof PromptArmorConfigSchema>;
export type TargetConfigZ = z.infer<typeof TargetConfigSchema>;
export type ScanConfig = z.infer<typeof ScanConfigSchema>;
export type JudgeConfig = z.infer<typeof JudgeConfigSchema>;
