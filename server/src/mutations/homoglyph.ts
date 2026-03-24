import type { MutationStrategy } from './base.js';

const homoglyphMap: Record<string, string> = {
  a: 'а', // Cyrillic а
  c: 'с', // Cyrillic с
  e: 'е', // Cyrillic е
  o: 'о', // Cyrillic о
  p: 'р', // Cyrillic р
  x: 'х', // Cyrillic х
  y: 'у', // Cyrillic у
  A: 'А',
  B: 'В',
  C: 'С',
  E: 'Е',
  H: 'Н',
  K: 'К',
  M: 'М',
  O: 'О',
  P: 'Р',
  T: 'Т',
  X: 'Х',
};

function toHomoglyph(text: string): string {
  return text.split('').map(c => homoglyphMap[c] ?? c).join('');
}

export const homoglyphMutation: MutationStrategy = {
  id: 'homoglyph',
  name: 'Homoglyph Substitution',
  description: 'Replaces characters with visually identical Unicode homoglyphs to bypass filters',
  mutate(prompt: string): string {
    return toHomoglyph(prompt);
  },
};
