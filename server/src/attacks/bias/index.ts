import { age } from './age.js';
import { gender } from './gender.js';
import { race } from './race.js';
import { disability } from './disability.js';
import { religion } from './religion.js';

import type { AttackPlugin } from '../types.js';

export const biasPlugins: AttackPlugin[] = [
  age,
  gender,
  race,
  disability,
  religion,
];
