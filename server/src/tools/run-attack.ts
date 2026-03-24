/**
 * MCP Tool: prompt_armor_run_attack
 * Runs a single attack plugin against a target endpoint.
 */

import type { AttackPlugin, AttackContext, AttackResult, TargetConfig } from '../attacks/types.js';
import { sendPrompt } from '../client/index.js';
import { judge, type JudgeOptions } from '../judge/index.js';

export interface RunAttackInput {
  pluginId: string;
  url: string;
  format?: 'openai' | 'anthropic' | 'rest-json' | 'custom';
  method?: string;
  headers?: Record<string, string>;
  requestField?: string;
  responseField?: string;
  systemPrompt?: string;
  targetDescription?: string;
}

export interface RunAttackOutput {
  success: boolean;
  results: AttackResult[];
  message: string;
}

export async function runAttack(
  input: RunAttackInput,
  plugins: AttackPlugin[],
  judgeOptions: JudgeOptions = {},
): Promise<RunAttackOutput> {
  const plugin = plugins.find(p => p.id === input.pluginId);
  if (!plugin) {
    return {
      success: false,
      results: [],
      message: `Plugin "${input.pluginId}" not found. Use prompt_armor_list_plugins to see available plugins.`,
    };
  }

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
  };

  const cases = await plugin.generatePrompts(ctx);
  const results: AttackResult[] = [];

  for (const ac of cases) {
    const start = performance.now();
    let response = '';
    try {
      const result = await sendPrompt(ac.prompt, target);
      response = result.response;
    } catch (err) {
      response = `[ERROR] ${err instanceof Error ? err.message : String(err)}`;
    }

    const verdict = await judge(ac.prompt, response, ac.indicators, judgeOptions);
    const duration = performance.now() - start;

    results.push({
      attackId: plugin.id,
      category: plugin.category,
      prompt: ac.prompt,
      response,
      passed: verdict.passed,
      severity: verdict.passed ? 'low' : plugin.severity,
      confidence: verdict.confidence,
      method: verdict.method,
      reasoning: verdict.reasoning,
      evidence: verdict.evidence,
      duration,
    });
  }

  const failed = results.filter(r => !r.passed).length;

  return {
    success: true,
    results,
    message: `Ran ${results.length} attack(s) for plugin "${plugin.name}": ${failed} failed, ${results.length - failed} passed`,
  };
}
