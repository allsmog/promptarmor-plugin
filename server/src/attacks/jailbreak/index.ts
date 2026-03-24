import { basicIgnore } from './basic-ignore.js';
import { roleSwitch } from './role-switch.js';
import { base64Encoded } from './base64-encoded.js';
import { systemPromptExtract } from './system-prompt-extract.js';
import { hypotheticalBypass } from './hypothetical-bypass.js';
import { developerMode } from './developer-mode.js';
import { translationSmuggle } from './translation-smuggle.js';
import { fewShotPrime } from './few-shot-prime.js';
import { contextStuffing } from './context-stuffing.js';
import { markdownInjection } from './markdown-injection.js';
import { roleplayEscape } from './roleplay-escape.js';
import { instructionDelimiter } from './instruction-delimiter.js';
import { multiLanguage } from './multi-language.js';

import type { AttackPlugin } from '../types.js';

export const jailbreakPlugins: AttackPlugin[] = [
  basicIgnore,
  roleSwitch,
  base64Encoded,
  systemPromptExtract,
  hypotheticalBypass,
  developerMode,
  translationSmuggle,
  fewShotPrime,
  contextStuffing,
  markdownInjection,
  roleplayEscape,
  instructionDelimiter,
  multiLanguage,
];
