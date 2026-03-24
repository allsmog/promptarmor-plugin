import type { MutationStrategy } from './base.js';

function shuffleCase(text: string): string {
  return text.split('').map(c => {
    if (Math.random() > 0.5) return c.toUpperCase();
    return c.toLowerCase();
  }).join('');
}

function addTypos(text: string): string {
  const words = text.split(' ');
  return words.map(word => {
    if (word.length > 4 && Math.random() > 0.7) {
      const pos = Math.floor(Math.random() * (word.length - 1)) + 1;
      return word.slice(0, pos) + word[pos + 1] + word[pos] + word.slice(pos + 2);
    }
    return word;
  }).join(' ');
}

export const bestOfNMutation: MutationStrategy = {
  id: 'best-of-n',
  name: 'Best-of-N Jailbreaking',
  description: 'Generates N random perturbations of the prompt (case shuffling, typos, spacing) — statistically one may bypass filters',
  mutate(prompt: string): string[] {
    const variants: string[] = [];
    for (let i = 0; i < 5; i++) {
      const variant = Math.random() > 0.5 ? shuffleCase(prompt) : addTypos(prompt);
      variants.push(variant);
    }
    return variants;
  },
};
