/**
 * Plain text report generator.
 */

import type { ScanResult, AttackResult, Severity } from '../attacks/types.js';

function severityLabel(severity: Severity): string {
  const labels: Record<Severity, string> = {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
  };
  return labels[severity];
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatResult(result: AttackResult, index: number): string {
  const status = result.passed ? 'PASS' : 'FAIL';
  const lines: string[] = [
    `  ${index + 1}. [${status}] [${severityLabel(result.severity)}] ${result.category} — ${result.attackId}`,
    `     Prompt:   ${truncate(result.prompt, 100)}`,
    `     Response: ${truncate(result.response, 100)}`,
    `     Method:   ${result.method} (confidence: ${(result.confidence * 100).toFixed(0)}%)`,
    `     Reason:   ${result.reasoning}`,
  ];
  if (result.mutation) {
    lines.push(`     Mutation: ${result.mutation}`);
  }
  if (result.evidence) {
    lines.push(`     Evidence: ${truncate(result.evidence, 80)}`);
  }
  lines.push(`     Duration: ${formatDuration(result.duration)}`);
  return lines.join('\n');
}

function truncate(text: string, maxLen: number): string {
  const single = text.replace(/\n/g, ' ').trim();
  if (single.length <= maxLen) return single;
  return single.slice(0, maxLen - 3) + '...';
}

export function generateTextReport(scan: ScanResult): string {
  const lines: string[] = [];

  lines.push('='.repeat(72));
  lines.push('  PromptArmor Scan Report');
  lines.push('='.repeat(72));
  lines.push('');
  lines.push(`  Scan ID:    ${scan.id}`);
  lines.push(`  Timestamp:  ${scan.timestamp}`);
  lines.push(`  Target:     ${scan.target.url}`);
  lines.push(`  Duration:   ${formatDuration(scan.duration)}`);
  lines.push('');

  // Summary
  lines.push('-'.repeat(72));
  lines.push('  Summary');
  lines.push('-'.repeat(72));
  lines.push(`  Total:    ${scan.summary.total}`);
  lines.push(`  Passed:   ${scan.summary.passed}`);
  lines.push(`  Failed:   ${scan.summary.failed}`);
  lines.push('');

  // By severity
  lines.push('  By Severity:');
  for (const sev of ['critical', 'high', 'medium', 'low'] as Severity[]) {
    const count = scan.summary.bySeverity[sev] ?? 0;
    if (count > 0) {
      lines.push(`    ${severityLabel(sev).padEnd(10)} ${count}`);
    }
  }
  lines.push('');

  // By category
  lines.push('  By Category:');
  for (const [cat, counts] of Object.entries(scan.summary.byCategory)) {
    lines.push(`    ${cat.padEnd(14)} passed: ${counts.passed}  failed: ${counts.failed}`);
  }
  lines.push('');

  // Failed results
  const failed = scan.results.filter(r => !r.passed);
  if (failed.length > 0) {
    lines.push('-'.repeat(72));
    lines.push('  Vulnerabilities Found');
    lines.push('-'.repeat(72));
    lines.push('');
    failed.forEach((r, i) => {
      lines.push(formatResult(r, i));
      lines.push('');
    });
  }

  // Passed results
  const passed = scan.results.filter(r => r.passed);
  if (passed.length > 0) {
    lines.push('-'.repeat(72));
    lines.push('  Passed Tests');
    lines.push('-'.repeat(72));
    lines.push('');
    passed.forEach((r, i) => {
      lines.push(formatResult(r, i));
      lines.push('');
    });
  }

  lines.push('='.repeat(72));
  lines.push('  End of Report');
  lines.push('='.repeat(72));

  return lines.join('\n');
}
