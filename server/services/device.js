const fs = require('fs');
const config = require('../config');
const { runCommand, resolveTool } = require('./shell');

function getIdeviceId() {
  return resolveTool(config.ideviceIdExe, ['idevice_id']);
}

function getIdeviceInfo() {
  return resolveTool(config.ideviceInfoExe, ['ideviceinfo']);
}

function getIdeviceInstaller() {
  return resolveTool(config.ideviceInstallerExe, ['ideviceinstaller']);
}

async function listDevices() {
  const exe = getIdeviceId();
  if (!fs.existsSync(exe) && exe === config.ideviceIdExe) {
    return {
      available: false,
      devices: [],
      message: 'libimobiledevice not found. Run npm run setup or install iTunes/Apple Mobile Device Support.',
    };
  }

  const result = await runCommand(exe, ['-l']);
  const udidLines = result.stdout
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 20);

  const devices = [];
  for (const udid of udidLines) {
    const info = await getDeviceInfo(udid);
    devices.push({ udid, ...info });
  }

  return { available: true, devices, raw: result.stdout };
}

async function getDeviceInfo(udid) {
  const exe = getIdeviceInfo();
  const args = udid ? ['-u', udid] : [];
  const result = await runCommand(exe, args);

  const info = {};
  for (const line of result.stdout.split('\n')) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      info[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }

  return {
    name: info.DeviceName || 'Unknown',
    model: info.ProductType || '',
    ios: info.ProductVersion || '',
    serial: info.SerialNumber || '',
  };
}

async function installIpa(ipaPath, udid) {
  const exe = getIdeviceInstaller();
  const args = udid ? ['-u', udid, '-i', ipaPath] : ['-i', ipaPath];
  return runCommand(exe, args);
}

async function checkTools() {
  const checks = [
    { name: 'idevice_id', path: getIdeviceId() },
    { name: 'ideviceinfo', path: getIdeviceInfo() },
    { name: 'ideviceinstaller', path: getIdeviceInstaller() },
  ];

  return checks.map((c) => ({
    ...c,
    exists: fs.existsSync(c.path),
  }));
}

module.exports = {
  listDevices,
  getDeviceInfo,
  installIpa,
  checkTools,
};
