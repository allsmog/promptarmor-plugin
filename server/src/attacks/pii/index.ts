import { directDisclosure } from './direct-disclosure.js';
import { sessionLeak } from './session-leak.js';
import { socialEngineering } from './social-engineering.js';
import { apiDbLeak } from './api-db-leak.js';

import type { AttackPlugin } from '../types.js';

export const piiPlugins: AttackPlugin[] = [
  directDisclosure,
  sessionLeak,
  socialEngineering,
  apiDbLeak,
];
