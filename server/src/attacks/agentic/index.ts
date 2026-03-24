import { memoryPoisoning } from './memory-poisoning.js';
import { crossSessionLeak } from './cross-session-leak.js';
import { goalMisalignment } from './goal-misalignment.js';

import type { AttackPlugin } from '../types.js';

export const agenticPlugins: AttackPlugin[] = [
  memoryPoisoning,
  crossSessionLeak,
  goalMisalignment,
];
