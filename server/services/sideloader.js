/**
 * Signing & Apple ID sideload via Sideloader (open-source Sideloadly alternative).
 * Source: https://github.com/Dadoum/Sideloader
 * Uses zsign internally (https://github.com/zhlynn/zsign) for Mach-O signing.
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { runCommand, resolveTool } = require('./shell');

function getSideloaderExe() {
  const toolsDir = path.join(config.toolsDir, 'sideloader');
  const candidates = [
    config.sideloaderExe,
    path.join(toolsDir, 'sideloader-cli-windows-x86_64.exe'),
    path.join(toolsDir, 'sideloader.exe'),
  ];
  return resolveTool(candidates[0], candidates.slice(1));
}

function isAvailable() {
  return fs.existsSync(getSideloaderExe());
}

async function getVersion() {
  const exe = getSideloaderExe();
  return runCommand(exe, ['version']);
}

/**
 * Full Apple ID sideload: register app ID, fetch cert, sign with zsign, install.
 * Equivalent to Sideloadly's "Apple ID Sideload" mode.
 */
async function installWithAppleId(options, onLog) {
  const {
    ipaPath,
    appleId,
    password,
    bundleId,
    appName,
    udid,
    anisetteServer,
  } = options;

  const exe = getSideloaderExe();
  if (!fs.existsSync(exe)) {
    throw new Error(
      'Sideloader not found. Download sideloader-cli-windows-x86_64.zip from ' +
      'https://github.com/Dadoum/Sideloader/releases and extract to tools/sideloader/'
    );
  }

  const args = ['install', ipaPath];

  if (appleId) args.push('-a', appleId);
  if (password) args.push('-p', password);
  if (bundleId) args.push('-b', bundleId);
  if (appName) args.push('-n', appName);
  if (udid) args.push('-u', udid);
  if (anisetteServer) args.push('--anisette-server', anisetteServer);

  return runCommand(exe, args, {
    cwd: path.dirname(exe),
    onData: onLog,
    env: {
      PATH: `${path.dirname(exe)}${path.delimiter}${process.env.PATH}`,
    },
  });
}

/**
 * Sign an app bundle or IPA with fetched developer certificate.
 */
async function signApp(options, onLog) {
  const { inputPath, appleId, password, bundleId, outputPath } = options;
  const exe = getSideloaderExe();

  const args = ['sign', inputPath];
  if (appleId) args.push('-a', appleId);
  if (password) args.push('-p', password);
  if (bundleId) args.push('-b', bundleId);
  if (outputPath) args.push('-o', outputPath);

  return runCommand(exe, args, {
    cwd: path.dirname(exe),
    onData: onLog,
    env: {
      PATH: `${path.dirname(exe)}${path.delimiter}${process.env.PATH}`,
    },
  });
}

async function manageCerts(action, appleId, password, onLog) {
  const exe = getSideloaderExe();
  const args = ['cert', action];
  if (appleId) args.push('-a', appleId);
  if (password) args.push('-p', password);

  return runCommand(exe, args, {
    cwd: path.dirname(exe),
    onData: onLog,
  });
}

module.exports = {
  getSideloaderExe,
  isAvailable,
  getVersion,
  installWithAppleId,
  signApp,
  manageCerts,
};
