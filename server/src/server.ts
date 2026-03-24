/**
 * MCP server setup — registers all 9 tools with proper Zod input schemas.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { AttackPlugin } from './attacks/types.js';
import type { StateStore } from './state/store.js';
import type { JudgeOptions } from './judge/index.js';

import { scan } from './tools/scan.js';
import { listScans } from './tools/list-scans.js';
import { getScan } from './tools/get-scan.js';
import { deleteScan } from './tools/delete-scan.js';
import { generateReportTool } from './tools/generate-report.js';
import { listPlugins } from './tools/list-plugins.js';
import { runAttack } from './tools/run-attack.js';
import { configureTarget } from './tools/configure-target.js';
import { checkHealth } from './tools/check-health.js';

export interface ServerDeps {
  plugins: AttackPlugin[];
  store: StateStore;
  judgeOptions?: JudgeOptions;
}

export function createMcpServer(deps: ServerDeps): McpServer {
  const { plugins, store, judgeOptions = {} } = deps;

  const server = new McpServer({
    name: 'prompt-armor',
    version: '1.0.0',
  });

  // 1. prompt_armor_scan — Run a full security scan
  server.tool(
    'prompt_armor_scan',
    'Run a comprehensive LLM security scan against a target endpoint. Tests for prompt injection, jailbreaks, tool abuse, PII leakage, bias, and more.',
    {
      url: z.string().url().describe('Target endpoint URL'),
      format: z.enum(['openai', 'anthropic', 'rest-json', 'custom']).optional().describe('API format of the target'),
      method: z.string().optional().describe('HTTP method (default: POST)'),
      headers: z.record(z.string()).optional().describe('Additional HTTP headers'),
      requestField: z.string().optional().describe('JSON field name for the prompt in request body'),
      responseField: z.string().optional().describe('JSON field path to extract response from'),
      systemPrompt: z.string().optional().describe('System prompt of the target (for context-aware attacks)'),
      targetDescription: z.string().optional().describe('Description of what the target LLM does'),
      categories: z.array(z.string()).optional().describe('Attack categories to include'),
      severity: z.array(z.string()).optional().describe('Minimum severity levels to include'),
      concurrency: z.number().int().min(1).max(50).optional().describe('Max concurrent requests'),
      numVariants: z.number().int().min(1).max(100).optional().describe('Number of attack variants per plugin'),
    },
    async (input) => {
      try {
        const result = await scan(input, plugins, store, judgeOptions);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Scan failed: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // 2. prompt_armor_list_scans — List scan history
  server.tool(
    'prompt_armor_list_scans',
    'List all previous security scan records, newest first.',
    {
      limit: z.number().int().min(1).optional().describe('Maximum number of scans to return'),
      status: z.enum(['pending', 'running', 'completed', 'failed']).optional().describe('Filter by scan status'),
    },
    async (input) => {
      try {
        const result = await listScans(input, store);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to list scans: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // 3. prompt_armor_get_scan — Get scan details
  server.tool(
    'prompt_armor_get_scan',
    'Retrieve detailed results for a specific security scan by its ID.',
    {
      scanId: z.string().describe('The scan ID to retrieve'),
    },
    async (input) => {
      try {
        const result = await getScan(input, store);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to get scan: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // 4. prompt_armor_delete_scan — Delete a scan record
  server.tool(
    'prompt_armor_delete_scan',
    'Delete a security scan record by its ID.',
    {
      scanId: z.string().describe('The scan ID to delete'),
    },
    async (input) => {
      try {
        const result = await deleteScan(input, store);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to delete scan: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // 5. prompt_armor_generate_report — Generate a report
  server.tool(
    'prompt_armor_generate_report',
    'Generate a security report for a completed scan in text, JSON, or SARIF format.',
    {
      scanId: z.string().describe('The scan ID to generate a report for'),
      format: z.enum(['text', 'json', 'sarif']).optional().describe('Report format (default: text)'),
      outputDir: z.string().optional().describe('Directory to write the report file to'),
    },
    async (input) => {
      try {
        const result = await generateReportTool(input, store);
        return {
          content: [
            {
              type: 'text' as const,
              text: result.success
                ? `${result.message}\n\n${result.content}`
                : result.message,
            },
          ],
          isError: !result.success,
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to generate report: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // 6. prompt_armor_list_plugins — List available attack plugins
  server.tool(
    'prompt_armor_list_plugins',
    'List all available attack plugins with their metadata, categories, and severity levels.',
    {
      category: z.string().optional().describe('Filter by attack category'),
      severity: z.string().optional().describe('Filter by severity level'),
    },
    async (input) => {
      const result = listPlugins(input, plugins);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  // 7. prompt_armor_run_attack — Run a single attack plugin
  server.tool(
    'prompt_armor_run_attack',
    'Run a specific attack plugin against a target endpoint. Useful for testing individual vulnerability types.',
    {
      pluginId: z.string().describe('ID of the attack plugin to run'),
      url: z.string().url().describe('Target endpoint URL'),
      format: z.enum(['openai', 'anthropic', 'rest-json', 'custom']).optional().describe('API format of the target'),
      method: z.string().optional().describe('HTTP method (default: POST)'),
      headers: z.record(z.string()).optional().describe('Additional HTTP headers'),
      requestField: z.string().optional().describe('JSON field name for the prompt in request body'),
      responseField: z.string().optional().describe('JSON field path to extract response from'),
      systemPrompt: z.string().optional().describe('System prompt of the target'),
      targetDescription: z.string().optional().describe('Description of what the target LLM does'),
    },
    async (input) => {
      try {
        const result = await runAttack(input, plugins, judgeOptions);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
          isError: !result.success,
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to run attack: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // 8. prompt_armor_configure_target — Validate target configuration
  server.tool(
    'prompt_armor_configure_target',
    'Validate and preview the configuration for a target endpoint. Shows how requests will be formatted.',
    {
      url: z.string().describe('Target endpoint URL'),
      format: z.enum(['openai', 'anthropic', 'rest-json', 'custom']).optional().describe('API format of the target'),
      method: z.string().optional().describe('HTTP method (default: POST)'),
      headers: z.record(z.string()).optional().describe('Additional HTTP headers'),
      requestField: z.string().optional().describe('JSON field name for the prompt in request body'),
      responseField: z.string().optional().describe('JSON field path to extract response from'),
    },
    async (input) => {
      const result = configureTarget(input);
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
        isError: !result.valid,
      };
    },
  );

  // 9. prompt_armor_check_health — Health check
  server.tool(
    'prompt_armor_check_health',
    'Check the health of the PromptArmor server and optionally verify connectivity to a target endpoint.',
    {
      url: z.string().url().optional().describe('Target endpoint URL to check connectivity'),
      format: z.enum(['openai', 'anthropic', 'rest-json', 'custom']).optional().describe('API format for the target health check'),
      headers: z.record(z.string()).optional().describe('Headers for the target health check'),
    },
    async (input) => {
      try {
        const result = await checkHealth(input, store);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Health check failed: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  return server;
}
