/**
 * Config loader — reads YAML (parsed as JSON for now), validates with Zod, merges defaults.
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PromptArmorConfigSchema, type PromptArmorConfig } from './schema.js';

export { PromptArmorConfigSchema, type PromptArmorConfig } from './schema.js';

const CONFIG_FILENAMES = [
  'promptarmor.yaml',
  'promptarmor.yml',
  'promptarmor.json',
  '.promptarmor.yaml',
  '.promptarmor.yml',
  '.promptarmor.json',
];

/**
 * Try to find and read a config file from the given directory.
 */
async function findConfigFile(dir: string): Promise<string | null> {
  for (const name of CONFIG_FILENAMES) {
    const path = resolve(dir, name);
    try {
      return await readFile(path, 'utf-8');
    } catch {
      // File doesn't exist, try next
    }
  }
  return null;
}

/**
 * Parse a YAML-like config string.
 * For simplicity and zero-dependency goals, we handle JSON configs natively.
 * YAML support can be added by installing a YAML parser.
 */
function parseConfigContent(content: string, filename: string): unknown {
  const trimmed = content.trim();

  // JSON detection
  if (trimmed.startsWith('{')) {
    return JSON.parse(trimmed);
  }

  // Simple YAML-like key:value parser for basic configs.
  // For production YAML support, install 'yaml' package.
  if (filename.endsWith('.yaml') || filename.endsWith('.yml')) {
    // Attempt JSON parse first (some YAML is valid JSON)
    try {
      return JSON.parse(trimmed);
    } catch {
      throw new Error(
        `YAML parsing is not built-in. Please use a JSON config file, or install the 'yaml' npm package. ` +
        `Config file: ${filename}`,
      );
    }
  }

  return JSON.parse(trimmed);
}

/**
 * Load and validate configuration.
 * If configPath is provided, reads from that file.
 * Otherwise, searches for a config file in the given directory (default: cwd).
 */
export async function loadConfig(
  configPath?: string,
  searchDir?: string,
): Promise<PromptArmorConfig> {
  let raw: string | null = null;
  let filename = 'config.json';

  if (configPath) {
    const fullPath = resolve(configPath);
    raw = await readFile(fullPath, 'utf-8');
    filename = fullPath;
  } else {
    const dir = searchDir ?? process.cwd();
    raw = await findConfigFile(dir);
    if (raw === null) {
      throw new Error(
        `No PromptArmor config file found. Searched for: ${CONFIG_FILENAMES.join(', ')} ` +
        `in ${dir}`,
      );
    }
  }

  const parsed = parseConfigContent(raw, filename);
  const result = PromptArmorConfigSchema.safeParse(parsed);

  if (!result.success) {
    const issues = result.error.issues
      .map(i => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid PromptArmor config:\n${issues}`);
  }

  return result.data;
}

/**
 * Create a config from a partial object, applying defaults.
 */
export function createConfig(partial: Record<string, unknown>): PromptArmorConfig {
  const result = PromptArmorConfigSchema.parse(partial);
  return result;
}
