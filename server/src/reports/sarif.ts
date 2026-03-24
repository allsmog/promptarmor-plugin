/**
 * SARIF v2.1.0 report generator for integration with security tooling.
 * Produces a valid Static Analysis Results Interchange Format document.
 */

import type { ScanResult, AttackResult, Severity } from '../attacks/types.js';

// SARIF level mapping
function severityToLevel(severity: Severity): 'error' | 'warning' | 'note' {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'note';
  }
}

function severityToRank(severity: Severity): number {
  switch (severity) {
    case 'critical': return 9.5;
    case 'high': return 8.0;
    case 'medium': return 5.0;
    case 'low': return 2.0;
  }
}

interface SarifResult {
  ruleId: string;
  ruleIndex: number;
  level: 'error' | 'warning' | 'note';
  message: { text: string };
  properties: Record<string, unknown>;
}

interface SarifRule {
  id: string;
  name: string;
  shortDescription: { text: string };
  fullDescription: { text: string };
  defaultConfiguration: { level: 'error' | 'warning' | 'note' };
  properties: { 'security-severity': string; tags: string[] };
}

interface SarifDocument {
  $schema: string;
  version: string;
  runs: Array<{
    tool: {
      driver: {
        name: string;
        version: string;
        informationUri: string;
        rules: SarifRule[];
      };
    };
    results: SarifResult[];
    invocations: Array<{
      executionSuccessful: boolean;
      startTimeUtc: string;
      endTimeUtc?: string;
      properties: Record<string, unknown>;
    }>;
  }>;
}

function buildRules(results: AttackResult[]): { rules: SarifRule[]; ruleIndex: Map<string, number> } {
  const ruleIndex = new Map<string, number>();
  const rules: SarifRule[] = [];

  for (const result of results) {
    const ruleId = `PA-${result.category.toUpperCase()}-${result.attackId}`;
    if (!ruleIndex.has(ruleId)) {
      ruleIndex.set(ruleId, rules.length);
      rules.push({
        id: ruleId,
        name: `${result.category}/${result.attackId}`,
        shortDescription: { text: `${result.category} attack: ${result.attackId}` },
        fullDescription: { text: result.reasoning },
        defaultConfiguration: { level: severityToLevel(result.severity) },
        properties: {
          'security-severity': severityToRank(result.severity).toFixed(1),
          tags: ['security', 'llm', 'prompt-injection', result.category],
        },
      });
    }
  }

  return { rules, ruleIndex };
}

export function generateSarifReport(scan: ScanResult): string {
  const failedResults = scan.results.filter(r => !r.passed);
  const { rules, ruleIndex } = buildRules(failedResults);

  const sarifResults: SarifResult[] = failedResults.map(result => {
    const ruleId = `PA-${result.category.toUpperCase()}-${result.attackId}`;
    return {
      ruleId,
      ruleIndex: ruleIndex.get(ruleId) ?? 0,
      level: severityToLevel(result.severity),
      message: {
        text: [
          `Attack "${result.attackId}" (${result.category}) — ${result.passed ? 'PASSED' : 'FAILED'}`,
          `Severity: ${result.severity}`,
          `Confidence: ${(result.confidence * 100).toFixed(0)}%`,
          `Method: ${result.method}`,
          `Reasoning: ${result.reasoning}`,
          result.evidence ? `Evidence: ${result.evidence}` : '',
          result.mutation ? `Mutation: ${result.mutation}` : '',
        ].filter(Boolean).join('\n'),
      },
      properties: {
        category: result.category,
        severity: result.severity,
        confidence: result.confidence,
        method: result.method,
        prompt: result.prompt,
        response: result.response,
        duration: result.duration,
      },
    };
  });

  const endTime = new Date(
    new Date(scan.timestamp).getTime() + scan.duration,
  ).toISOString();

  const sarif: SarifDocument = {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'PromptArmor',
            version: '1.0.0',
            informationUri: 'https://promptarmor.dev',
            rules,
          },
        },
        results: sarifResults,
        invocations: [
          {
            executionSuccessful: true,
            startTimeUtc: scan.timestamp,
            endTimeUtc: endTime,
            properties: {
              target: scan.target.url,
              totalTests: scan.summary.total,
              passed: scan.summary.passed,
              failed: scan.summary.failed,
            },
          },
        ],
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}
