/**
 * MCP Tool: prompt_armor_scan
 * Runs a full security scan against a target LLM endpoint.
 */

import { randomUUID } from 'node:crypto';
import type { AttackPlugin, AttackContext, AttackResult, ScanResult, Severity, TargetConfig } from '../attacks/types.js';
import { sendPrompt } from '../client/index.js';
import { judge, type JudgeOptions } from '../judge/index.js';
import type { StateStore } from '../state/store.js';

export interface ScanInput {
  url: string;
  format?: 'openai' | 'anthropic' | 'rest-json' | 'custom';
  method?: string;
  headers?: Record<string, string>;
  requestField?: string;
  responseField?: string;
  systemPrompt?: string;
  targetDescription?: string;
  categories?: string[];
  severity?: string[];
  concurrency?: number;
  numVariants?: number;
}

export async function scan(
  input: ScanInput,
  plugins: AttackPlugin[],
  store: StateStore,
  judgeOptions: JudgeOptions = {},
): Promise<ScanResult> {
  const scanId = randomUUID();
  const startTime = performance.now();

  const target: TargetConfig = {
    url: input.url,
    format: input.format ?? 'rest-json',
    method: input.method,
    headers: input.headers,
    requestField: input.requestField,
    responseField: input.responseField,
  };

  const ctx: AttackContext = {
    systemPrompt: input.systemPrompt,
    targetDescription: input.targetDescription,
    target,
    numVariants: input.numVariants ?? 5,
  };

  // Filter plugins by category and severity
  let activePlugins = plugins;
  if (input.categories && input.categories.length > 0) {
    const cats = new Set(input.categories);
    activePlugins = activePlugins.filter(p => cats.has(p.category));
  }
  if (input.severity && input.severity.length > 0) {
    const sevs = new Set(input.severity);
    activePlugins = activePlugins.filter(p => sevs.has(p.severity));
  }

  // Save initial scan record
  await store.saveScan({
    id: scanId,
    timestamp: new Date().toISOString(),
    target,
    status: 'running',
  });

  const results: AttackResult[] = [];
  const concurrency = input.concurrency ?? 5;

  // Generate all attack cases
  const attackQueue: Array<{ plugin: AttackPlugin; prompt: string; indicators: string[] }> = [];
  for (const plugin of activePlugins) {
    const cases = await plugin.generatePrompts(ctx);
    for (const ac of cases) {
      attackQueue.push({ plugin, prompt: ac.prompt, indicators: ac.indicators });
    }
  }

  // Execute attacks with concurrency control
  const executing = new Set<Promise<void>>();
  for (const attack of attackQueue) {
    const task = (async () => {
      const attackStart = performance.now();
      let response = '';
      try {
        const result = await sendPrompt(attack.prompt, target);
        response = result.response;
      } catch (err) {
        response = `[ERROR] ${err instanceof Error ? err.message : String(err)}`;
      }

      const verdict = await judge(attack.prompt, response, attack.indicators, judgeOptions);
      const duration = performance.now() - attackStart;

      results.push({
        attackId: attack.plugin.id,
        category: attack.plugin.category,
        prompt: attack.prompt,
        response,
        passed: verdict.passed,
        severity: verdict.passed ? 'low' : attack.plugin.severity,
        confidence: verdict.confidence,
        method: verdict.method,
        reasoning: verdict.reasoning,
        evidence: verdict.evidence,
        duration,
      });
    })();

    executing.add(task);
    task.finally(() => executing.delete(task));

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);

  const totalDuration = performance.now() - startTime;

  // Build summary
  const bySeverity: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  const byCategory: Record<string, { passed: number; failed: number }> = {};

  for (const r of results) {
    if (!r.passed) {
      bySeverity[r.severity]++;
    }
    if (!byCategory[r.category]) {
      byCategory[r.category] = { passed: 0, failed: 0 };
    }
    if (r.passed) {
      byCategory[r.category].passed++;
    } else {
      byCategory[r.category].failed++;
    }
  }

  const scanResult: ScanResult = {
    id: scanId,
    timestamp: new Date().toISOString(),
    target,
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      bySeverity,
      byCategory,
    },
    duration: totalDuration,
  };

  // Persist final result
  await store.saveScan({
    id: scanId,
    timestamp: scanResult.timestamp,
    target,
    status: 'completed',
    result: scanResult,
  });

  return scanResult;
}
