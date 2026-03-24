import { documentExfiltration } from './document-exfiltration.js';
import { sourceAttribution } from './source-attribution.js';
import { poisoning } from './poisoning.js';

import type { AttackPlugin } from '../types.js';

export const ragPlugins: AttackPlugin[] = [
  documentExfiltration,
  sourceAttribution,
  poisoning,
];
