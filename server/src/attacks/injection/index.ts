import { directPromptInjection } from './direct-prompt-injection.js';
import { indirectPromptInjection } from './indirect-prompt-injection.js';
import { contextComplianceAttack } from './context-compliance-attack.js';
import { promptExtraction } from './prompt-extraction.js';
import { systemOverride } from './system-override.js';

import type { AttackPlugin } from '../types.js';

export const injectionPlugins: AttackPlugin[] = [
  directPromptInjection,
  indirectPromptInjection,
  contextComplianceAttack,
  promptExtraction,
  systemOverride,
];
