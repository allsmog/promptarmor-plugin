import { violentCrime } from './violent-crime.js';
import { nonViolentCrime } from './non-violent-crime.js';
import { childExploitation } from './child-exploitation.js';
import { hate } from './hate.js';
import { selfHarm } from './self-harm.js';
import { sexualContent } from './sexual-content.js';
import { illegalDrugs } from './illegal-drugs.js';
import { weapons } from './weapons.js';
import { cybercrime } from './cybercrime.js';
import { radicalization } from './radicalization.js';
import { misinformation } from './misinformation.js';
import { harassment } from './harassment.js';
import { profanity } from './profanity.js';
import { graphicContent } from './graphic-content.js';
import { unsafePractices } from './unsafe-practices.js';
import { copyright } from './copyright.js';
import { specializedAdvice } from './specialized-advice.js';
import { privacyViolation } from './privacy-violation.js';

import type { AttackPlugin } from '../types.js';

export const harmfulPlugins: AttackPlugin[] = [
  violentCrime,
  nonViolentCrime,
  childExploitation,
  hate,
  selfHarm,
  sexualContent,
  illegalDrugs,
  weapons,
  cybercrime,
  radicalization,
  misinformation,
  harassment,
  profanity,
  graphicContent,
  unsafePractices,
  copyright,
  specializedAdvice,
  privacyViolation,
];
