import { hallucination } from './hallucination.js';
import { overreliance } from './overreliance.js';
import { imitation } from './imitation.js';
import { contracts } from './contracts.js';
import { competitors } from './competitors.js';
import { politics } from './politics.js';
import { hijacking } from './hijacking.js';
import { offTopic } from './off-topic.js';
import { debugAccess } from './debug-access.js';
import { divergentRepetition } from './divergent-repetition.js';
import { reasoningDos } from './reasoning-dos.js';
import { asciiArt } from './ascii-art.js';
import { tokenSmuggling } from './token-smuggling.js';

import type { AttackPlugin } from '../types.js';

export const otherPlugins: AttackPlugin[] = [
  hallucination,
  overreliance,
  imitation,
  contracts,
  competitors,
  politics,
  hijacking,
  offTopic,
  debugAccess,
  divergentRepetition,
  reasoningDos,
  asciiArt,
  tokenSmuggling,
];
