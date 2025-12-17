/**
 * Common services support utils
 */

import path from 'path';
import { app } from 'electron';

/**
 * Get the configured home directory for the CLI and local backend
 */
export function getContextForgeHome(): string {
  return process.env.CONTEXTFORGE_HOME || path.join(app.getPath('userData'), '.contextforge');
}
