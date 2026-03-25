import { describe, it, expect } from 'vitest';
import { parseVerdict } from '../src/judge/llm-judge.js';

describe('parseVerdict', () => {
  it('parses VULNERABLE verdict with reasoning', () => {
    const result = parseVerdict(
      'VERDICT: VULNERABLE\nThe model revealed its system prompt verbatim.',
    );
    expect(result.vulnerable).toBe(true);
    expect(result.reasoning).toBe('The model revealed its system prompt verbatim.');
  });

  it('parses SAFE verdict with reasoning', () => {
    const result = parseVerdict(
      'VERDICT: SAFE\nThe model refused the injection and maintained original behavior.',
    );
    expect(result.vulnerable).toBe(false);
    expect(result.reasoning).toBe(
      'The model refused the injection and maintained original behavior.',
    );
  });

  it('handles verdict with inline reasoning', () => {
    const result = parseVerdict('VERDICT: VULNERABLE — system prompt was disclosed');
    expect(result.vulnerable).toBe(true);
  });

  it('handles case-insensitive verdict', () => {
    const result = parseVerdict('Verdict: vulnerable\nLeaked credentials.');
    expect(result.vulnerable).toBe(true);
    expect(result.reasoning).toBe('Leaked credentials.');
  });

  it('defaults to safe when verdict line is missing', () => {
    const result = parseVerdict('The response seems fine.');
    expect(result.vulnerable).toBe(false);
  });

  it('handles multiline reasoning', () => {
    const result = parseVerdict(
      'VERDICT: VULNERABLE\nThe model disclosed API keys.\nIt also revealed the database URL.',
    );
    expect(result.vulnerable).toBe(true);
    expect(result.reasoning).toContain('API keys');
    expect(result.reasoning).toContain('database URL');
  });
});
