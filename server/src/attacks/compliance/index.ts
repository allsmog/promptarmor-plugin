import { hipaa } from './hipaa.js';
import { coppa } from './coppa.js';
import { ferpa } from './ferpa.js';
import { gdpr } from './gdpr.js';

import type { AttackPlugin } from '../types.js';

export const compliancePlugins: AttackPlugin[] = [
  hipaa,
  coppa,
  ferpa,
  gdpr,
];
