/**
 * MCP Tool: prompt_armor_list_plugins
 * Lists all available attack plugins with their metadata.
 */

import type { AttackPlugin } from '../attacks/types.js';

export interface ListPluginsInput {
  category?: string;
  severity?: string;
}

export interface PluginInfo {
  id: string;
  category: string;
  name: string;
  description: string;
  severity: string;
  owasp?: string;
  compatibleMutations?: string[];
  excludedMutations?: string[];
}

export interface ListPluginsOutput {
  plugins: PluginInfo[];
  total: number;
}

export function listPlugins(
  input: ListPluginsInput,
  plugins: AttackPlugin[],
): ListPluginsOutput {
  let filtered = plugins;

  if (input.category) {
    filtered = filtered.filter(p => p.category === input.category);
  }
  if (input.severity) {
    filtered = filtered.filter(p => p.severity === input.severity);
  }

  return {
    plugins: filtered.map(p => ({
      id: p.id,
      category: p.category,
      name: p.name,
      description: p.description,
      severity: p.severity,
      owasp: p.owasp,
      compatibleMutations: p.compatibleMutations,
      excludedMutations: p.excludedMutations,
    })),
    total: filtered.length,
  };
}
