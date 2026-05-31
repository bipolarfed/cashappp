/**
 * IPA re-signing via zsign (used by Sideloadly/Sideloader internally).
 * Source: https://github.com/zhlynn/zsign
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { runCommand, resolveTool } = require('./shell');

function getZsignExe() {
  const candidates = [
    config.zsignExe,
    path.join(config.toolsDir, 'zsign', 'zsign.exe'),
    path.join(config.toolsDir, 'zsign.exe'),
  ];
  return resolveTool(candidates[0], candidates.slice(1));
}

function isAvailable() {
  return fs.existsSync(getZsignExe());
}

async function signIpa(options, onLog) {
  const {
    inputPath,
    outputPath,
    p12Path,
    p12Password,
    provisionPath,
    bundleId,
    bundleName,
    adhoc,
    force,
  } = options;

  const exe = getZsignExe();
  if (!fs.existsSync(exe)) {
    throw new Error(
      'zsign not found. Build from https://github.com/zhlynn/zsign or place zsign.exe in tools/zsign/'
    );
  }

  const args = [];

  if (adhoc) {
    args.push('-a');
  } else {
    if (p12Path) args.push('-k', p12Path);
    if (p12Password) args.push('-p', p12Password);
    if (provisionPath) args.push('-m', provisionPath);
  }

  if (outputPath) args.push('-o', outputPath);
  if (bundleId) args.push('-b', bundleId);
  if (bundleName) args.push('-n', bundleName);
  if (force) args.push('-f');

  args.push(inputPath);

  return runCommand(exe, args, { onData: onLog });
}

async function checkCertificate(filePath, password, onLog) {
  const exe = getZsignExe();
  const args = ['-C', filePath];
  if (password) args.push('-p', password);
  return runCommand(exe, args, { onData: onLog });
}

module.exports = {
  getZsignExe,
  isAvailable,
  signIpa,
  checkCertificate,
};
