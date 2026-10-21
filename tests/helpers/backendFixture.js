// Each Node test file gets its own real FastAPI server and temporary SQLite DB.
// No development data or browser localStorage is touched by tests.
import { before, after } from 'node:test';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
let child;
let folder;
let output = '';
let stopped;

before(async () => {
  const localPython = path.join(root, 'backend', '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
  const python = process.env.PYTHON_EXECUTABLE || (existsSync(localPython) ? localPython : 'python');
  const listener = createServer();
  await new Promise((resolve) => listener.listen(0, '127.0.0.1', resolve));
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  folder = await mkdtemp(path.join(tmpdir(), 'cs2-arena-test-'));
  process.env.VITE_API_BASE_URL = `http://127.0.0.1:${port}`;
  child = spawn(python, [path.join(root, 'tests/helpers/serve_backend.py'), String(port)], {
    cwd: path.join(root, 'backend'), windowsHide: true,
    env: { ...process.env, PYTHONPATH: path.join(root, 'backend'), DATABASE_URL: 'sqlite:///' + path.join(folder, 'test.db').replaceAll('\\', '/') },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  stopped = new Promise((resolve) => { child.once('close', resolve); });
  child.on('error', (error) => { output += error.message; });
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) throw new Error(output);
    try {
      if ((await fetch(process.env.VITE_API_BASE_URL + '/api/health')).ok) return;
    } catch { /* Wait for Uvicorn startup, not for a simulated response. */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Test backend did not start. Install backend/requirements.txt. ' + output);
}, { timeout: 20000 });

after(async () => {
  if (child && child.exitCode === null) {
    try { await fetch(process.env.VITE_API_BASE_URL + '/_test/shutdown', { method: 'POST', signal: AbortSignal.timeout(3000) }); }
    catch { child.kill(); }
    await stopped;
  }
  if (folder) {
    if (path.dirname(path.resolve(folder)) !== path.resolve(tmpdir()) || !path.basename(folder).startsWith('cs2-arena-test-')) throw new Error('Unexpected test directory; refusing cleanup.');
    await rm(folder, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
