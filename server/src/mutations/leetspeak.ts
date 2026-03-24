import type { MutationStrategy } from './base.js';

const leetMap: Record<string, string> = {
  a: '4', e: '3', i: '1', o: '0', s: '5', t: '7', l: '1', b: '8', g: '9',
  A: '4', E: '3', I: '1', O: '0', S: '5', T: '7', L: '1', B: '8', G: '9',
};

function toLeet(text: string): string {
  return text.split('').map(c => leetMap[c] ?? c).join('');
}

export const leetspeakMutation: MutationStrategy = {
  id: 'leetspeak',
  name: 'Leetspeak Encoding',
  description: 'Converts the attack prompt to leetspeak to bypass content filters',
  mutate(prompt: string): string {
    return toLeet(prompt);
  },
};
