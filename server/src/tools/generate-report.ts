/**
 * MCP Tool: prompt_armor_generate_report
 * Generates a report for a completed scan in the specified format.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { StateStore } from '../state/store.js';
import { generateReport, type ReportFormat } from '../reports/index.js';

export interface GenerateReportInput {
  scanId: string;
  format?: 'text' | 'json' | 'sarif';
  outputDir?: string;
}

export interface GenerateReportOutput {
  success: boolean;
  format: string;
  content: string;
  filePath?: string;
  message: string;
}

export async function generateReportTool(
  input: GenerateReportInput,
  store: StateStore,
): Promise<GenerateReportOutput> {
  const record = await store.loadScan(input.scanId);
  if (!record) {
    return {
      success: false,
      format: input.format ?? 'text',
      content: '',
      message: `Scan ${input.scanId} not found`,
    };
  }

  if (record.status !== 'completed' || !record.result) {
    return {
      success: false,
      format: input.format ?? 'text',
      content: '',
      message: `Scan ${input.scanId} is not completed (status: ${record.status})`,
    };
  }

  const format: ReportFormat = input.format ?? 'text';
  const content = generateReport(record.result, format);

  let filePath: string | undefined;
  if (input.outputDir) {
    const dir = resolve(input.outputDir);
    await mkdir(dir, { recursive: true });

    const ext = format === 'sarif' ? 'sarif.json' : format === 'json' ? 'json' : 'txt';
    const filename = `promptarmor-${input.scanId.slice(0, 8)}.${ext}`;
    filePath = join(dir, filename);
    await writeFile(filePath, content, 'utf-8');
  }

  return {
    success: true,
    format,
    content,
    filePath,
    message: filePath
      ? `Report written to ${filePath}`
      : `Report generated successfully (${format} format)`,
  };
}
