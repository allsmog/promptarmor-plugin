import type { MutationStrategy } from './base.js';

const emojiMap: Record<string, string> = {
  a: '🅰️', b: '🅱️', i: 'ℹ️', o: '⭕', p: '🅿️', m: 'Ⓜ️',
};

function insertEmojis(text: string): string {
  return text.split(' ').map(word => {
    if (word.length > 4) {
      const mid = Math.floor(word.length / 2);
      // Insert zero-width space and optionally substitute with emoji homoglyphs
      const chars = word.split('');
      const substituted = chars.map(c => emojiMap[c.toLowerCase()] ?? c);
      return substituted.slice(0, mid).join('') + '\u200B' + substituted.slice(mid).join('');
    }
    return word;
  }).join(' ');
}

export const emojiMutation: MutationStrategy = {
  id: 'emoji',
  name: 'Emoji & Zero-Width Insertion',
  description: 'Inserts zero-width characters and emoji substitutions to bypass token-level filters',
  mutate(prompt: string): string {
    return insertEmojis(prompt);
  },
};
