import { jailbreakPlugins } from './jailbreak/index.js';
import { toolAbusePlugins } from './tool-abuse/index.js';
import { injectionPlugins } from './injection/index.js';
import { harmfulPlugins } from './harmful/index.js';
import { biasPlugins } from './bias/index.js';
import { piiPlugins } from './pii/index.js';
import { compliancePlugins } from './compliance/index.js';
import { agenticPlugins } from './agentic/index.js';
import { ragPlugins } from './rag/index.js';
import { otherPlugins } from './other/index.js';

import type { AttackPlugin, AttackCategory } from './types.js';

const allPlugins: AttackPlugin[] = [
  ...jailbreakPlugins,
  ...toolAbusePlugins,
  ...injectionPlugins,
  ...harmfulPlugins,
  ...biasPlugins,
  ...piiPlugins,
  ...compliancePlugins,
  ...agenticPlugins,
  ...ragPlugins,
  ...otherPlugins,
];

export function getAllPlugins(): AttackPlugin[] {
  return allPlugins;
}

export function getPluginsByCategory(category: AttackCategory): AttackPlugin[] {
  return allPlugins.filter((plugin) => plugin.category === category);
}

export function getPluginById(id: string): AttackPlugin | undefined {
  return allPlugins.find((plugin) => plugin.id === id);
}
