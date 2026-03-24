import { sqlDropTable } from './sql-drop-table.js';
import { fileReadPasswd } from './file-read-passwd.js';
import { shellReverse } from './shell-reverse.js';
import { ssrfMetadata } from './ssrf-metadata.js';
import { envVarLeak } from './env-var-leak.js';
import { fileWrite } from './file-write.js';
import { dataExfiltration } from './data-exfiltration.js';
import { codeExecution } from './code-execution.js';
import { privilegeEscalation } from './privilege-escalation.js';
import { chainOfTools } from './chain-of-tools.js';
import { indirectInjection } from './indirect-injection.js';
import { toolNameGuess } from './tool-name-guess.js';

import type { AttackPlugin } from '../types.js';

export const toolAbusePlugins: AttackPlugin[] = [
  sqlDropTable,
  fileReadPasswd,
  shellReverse,
  ssrfMetadata,
  envVarLeak,
  fileWrite,
  dataExfiltration,
  codeExecution,
  privilegeEscalation,
  chainOfTools,
  indirectInjection,
  toolNameGuess,
];
