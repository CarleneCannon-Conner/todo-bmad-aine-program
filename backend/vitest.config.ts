import { defineConfig } from 'vitest/config';
import { readFileSync, existsSync } from 'fs';

function loadEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const env: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
  return env;
}

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    env: loadEnvFile('.env.test'),
  },
});
