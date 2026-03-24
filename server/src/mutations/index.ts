import type { MutationStrategy } from './base.js';
import { base64Mutation } from './base64.js';
import { rot13Mutation } from './rot13.js';
import { hexMutation } from './hex.js';
import { leetspeakMutation } from './leetspeak.js';
import { homoglyphMutation } from './homoglyph.js';
import { morseMutation } from './morse.js';
import { piglatinMutation } from './piglatin.js';
import { emojiMutation } from './emoji.js';
import { asciiSmugglingMutation } from './ascii-smuggling.js';
import { fewShotPrimeMutation } from './few-shot-prime.js';
import { contextStuffingMutation } from './context-stuffing.js';
import { instructionDelimiterMutation } from './instruction-delimiter.js';
import { markdownInjectionMutation } from './markdown-injection.js';
import { citationMutation } from './citation.js';
import { authoritativeMarkupMutation } from './authoritative-markup.js';
import { crescendoMutation } from './crescendo.js';
import { goatMutation } from './goat.js';
import { hydraMutation } from './hydra.js';
import { retryMutation } from './retry.js';
import { multilingualMutation } from './multilingual.js';
import { mathPromptMutation } from './math-prompt.js';
import { bestOfNMutation } from './best-of-n.js';
import { jailbreakTemplatesMutation } from './jailbreak-templates.js';
import { mischievousUserMutation } from './mischievous-user.js';
import { compositeMutation } from './composite.js';

export type { MutationStrategy } from './base.js';

const allMutations: MutationStrategy[] = [
  // Encoding
  base64Mutation,
  rot13Mutation,
  hexMutation,
  leetspeakMutation,
  homoglyphMutation,
  morseMutation,
  piglatinMutation,
  emojiMutation,
  asciiSmugglingMutation,
  // Structural
  fewShotPrimeMutation,
  contextStuffingMutation,
  instructionDelimiterMutation,
  markdownInjectionMutation,
  citationMutation,
  authoritativeMarkupMutation,
  // Multi-turn
  crescendoMutation,
  goatMutation,
  hydraMutation,
  retryMutation,
  // Advanced
  multilingualMutation,
  mathPromptMutation,
  bestOfNMutation,
  jailbreakTemplatesMutation,
  mischievousUserMutation,
  compositeMutation,
];

export function getAllMutations(): MutationStrategy[] {
  return allMutations;
}

export function getMutationById(id: string): MutationStrategy | undefined {
  return allMutations.find(m => m.id === id);
}

export function getMutationsByIds(ids: string[]): MutationStrategy[] {
  return ids.map(id => allMutations.find(m => m.id === id)).filter((m): m is MutationStrategy => m !== undefined);
}
