const path = require('path');

const ROOT = path.resolve(__dirname, '..');

module.exports = {
  root: ROOT,
  projectsDir: path.join(ROOT, 'projects'),
  toolsDir: path.join(ROOT, 'tools'),
  distDir: path.join(ROOT, 'dist'),
  port: process.env.PORT || 3847,

  sideloaderExe: process.env.SIDELOADER_EXE ||
    path.join(ROOT, 'tools', 'sideloader', 'sideloader-cli-windows-x86_64.exe'),

  zsignExe: process.env.ZSIGN_EXE ||
    path.join(ROOT, 'tools', 'zsign', 'zsign.exe'),

  ideviceIdExe: process.env.IDEVICE_ID_EXE ||
    path.join(ROOT, 'tools', 'libimobiledevice', 'idevice_id.exe'),

  ideviceInstallerExe: process.env.IDEVICE_INSTALLER_EXE ||
    path.join(ROOT, 'tools', 'libimobiledevice', 'ideviceinstaller.exe'),

  ideviceInfoExe: process.env.IDEVICE_INFO_EXE ||
    path.join(ROOT, 'tools', 'libimobiledevice', 'ideviceinfo.exe'),
};
