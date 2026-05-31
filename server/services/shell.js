const { spawn } = require('child_process');
const path = require('path');

function runCommand(exe, args, options = {}) {
  return new Promise((resolve) => {
    const cwd = options.cwd || process.cwd();
    const env = { ...process.env, ...options.env };

    const child = spawn(exe, args, {
      cwd,
      env,
      shell: false,
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (d) => { stdout += d.toString(); });
    child.stderr?.on('data', (d) => { stderr += d.toString(); });

    if (options.onData) {
      child.stdout?.on('data', (d) => options.onData(d.toString()));
      child.stderr?.on('data', (d) => options.onData(d.toString()));
    }

    child.on('error', (err) => {
      resolve({ code: -1, stdout, stderr: stderr + err.message, error: err.message });
    });

    child.on('close', (code) => {
      resolve({ code: code ?? -1, stdout, stderr });
    });
  });
}

function existsSync(fs, filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function resolveTool(exePath, fallbacks = []) {
  const fs = require('fs');
  if (existsSync(fs, exePath)) return exePath;
  for (const fb of fallbacks) {
    if (existsSync(fs, fb)) return fb;
  }
  return exePath;
}

module.exports = { runCommand, resolveTool, existsSync };
