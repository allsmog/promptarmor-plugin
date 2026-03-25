import { describe, it, expect } from 'vitest';
import { getAllPlugins } from '../src/attacks/index.js';

describe('attack plugin registry', () => {
  const plugins = getAllPlugins();

  it('has at least 80 plugins', () => {
    expect(plugins.length).toBeGreaterThanOrEqual(80);
  });

  it('every plugin has required fields', () => {
    for (const plugin of plugins) {
      expect(plugin.id).toBeTruthy();
      expect(plugin.category).toBeTruthy();
      expect(plugin.name).toBeTruthy();
      expect(plugin.severity).toMatch(/^(critical|high|medium|low)$/);
    }
  });

  it('every plugin generates at least one prompt', async () => {
    const ctx = {
      target: { url: 'http://localhost:4010', format: 'rest-json' as const },
      numVariants: 3,
    };
    for (const plugin of plugins) {
      const cases = await plugin.generatePrompts(ctx);
      expect(cases.length).toBeGreaterThanOrEqual(1);
      for (const c of cases) {
        expect(c.prompt).toBeTruthy();
        expect(Array.isArray(c.indicators)).toBe(true);
      }
    }
  });

  it('every plugin has non-empty indicators', () => {
    for (const plugin of plugins) {
      const indicators = plugin.getIndicators();
      expect(indicators.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('covers all 10 categories', () => {
    const categories = new Set(plugins.map(p => p.category));
    expect(categories).toContain('jailbreak');
    expect(categories).toContain('injection');
    expect(categories).toContain('tool-abuse');
    expect(categories).toContain('harmful');
    expect(categories).toContain('bias');
    expect(categories).toContain('pii');
    expect(categories).toContain('compliance');
    expect(categories).toContain('agentic');
    expect(categories).toContain('rag');
    expect(categories).toContain('other');
  });

  it('has grading criteria for every plugin', () => {
    for (const plugin of plugins) {
      const criteria = plugin.getGradingCriteria();
      expect(criteria.passDescription).toBeTruthy();
      expect(criteria.failDescription).toBeTruthy();
    }
  });
});
