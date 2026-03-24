/**
 * PromptArmor MCP Server — Entry point.
 * Creates the MCP server, loads all attack plugins from the registry, and connects via stdio transport.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './server.js';
import { createStore } from './state/store.js';
import { getAllPlugins } from './attacks/index.js';

async function main(): Promise<void> {
  const store = createStore();
  await store.init();

  const plugins = getAllPlugins();

  const server = createMcpServer({
    plugins,
    store,
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Failed to start PromptArmor MCP server:', err);
  process.exit(1);
});
