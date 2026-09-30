import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const port = 3199;
// Exercise the Android-specific configuration on Linux without pretending to run Android binaries.
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '-H', '127.0.0.1', '-p', String(port)], {
  env: { ...process.env, TERMUX_DEV: '1', NEXT_TELEMETRY_DISABLED: '1' }, stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
child.stdout.on('data', chunk => { logs += chunk; });
child.stderr.on('data', chunk => { logs += chunk; });
try {
  let ready = false;
  for (let i = 0; i < 200; i++) {
    if (child.exitCode !== null || child.signalCode !== null) throw new Error(`Dev server exited: ${logs}`);
    if (/Ready in/.test(logs)) { ready = true; break; }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(ready, true, `Termux configuration must start: ${logs}`);
  const response = await fetch(`http://127.0.0.1:${port}`, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200, logs);
  const html = await response.text();
  assert.match(html, /Pesquisa em fontes reais/);
  assert.doesNotMatch(logs, /Invalid configuration object|lightningcss\.android-arm64/);
  console.log('Termux-config development smoke passed: Webpack schema, page compilation and HTTP 200. Host is Linux; on-device confirmation still required.');
} finally {
  if (child.exitCode === null && child.signalCode === null) {
    const exited = new Promise(resolve => child.once('exit', resolve));
    child.kill('SIGTERM');
    await exited;
  }
}
