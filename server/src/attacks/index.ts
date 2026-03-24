import { jailbreakPlugins } from './jailbreak/index.js';
import { toolAbusePlugins } from './tool-abuse/index.js';

import type { AttackPlugin, AttackCategory } from './types.js';

const allPlugins: AttackPlugin[] = [
  ...jailbreakPlugins,
  ...toolAbusePlugins,
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
