const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const sideloader = require('../services/sideloader');
const zsign = require('../services/zsign');
const device = require('../services/device');

const router = express.Router();

const upload = multer({
  dest: path.join(config.distDir, 'uploads'),
  limits: { fileSize: 500 * 1024 * 1024 },
});

fs.mkdirSync(path.join(config.distDir, 'uploads'), { recursive: true });
fs.mkdirSync(config.distDir, { recursive: true });

router.get('/tools', (_req, res) => {
  res.json({
    sideloader: {
      available: sideloader.isAvailable(),
      path: sideloader.getSideloaderExe(),
    },
    zsign: {
      available: zsign.isAvailable(),
      path: zsign.getZsignExe(),
    },
    device: device.checkTools(),
  });
});

router.post('/apple-id-install', async (req, res) => {
  const {
    ipaPath,
    appleId,
    password,
    bundleId,
    appName,
    udid,
    anisetteServer,
  } = req.body;

  if (!ipaPath || !appleId || !password) {
    return res.status(400).json({ error: 'ipaPath, appleId, and password are required' });
  }

  const logs = [];
  try {
    const result = await sideloader.installWithAppleId(
      { ipaPath, appleId, password, bundleId, appName, udid, anisetteServer },
      (msg) => logs.push(msg)
    );
    res.json({ ok: result.code === 0, ...result, logs: logs.join('') });
  } catch (e) {
    res.status(500).json({ error: e.message, logs: logs.join('') });
  }
});

router.post('/zsign', async (req, res) => {
  const logs = [];
  try {
    const result = await zsign.signIpa(req.body, (msg) => logs.push(msg));
    res.json({ ok: result.code === 0, ...result, logs: logs.join('') });
  } catch (e) {
    res.status(500).json({ error: e.message, logs: logs.join('') });
  }
});

router.post('/check-cert', async (req, res) => {
  const { filePath, password } = req.body;
  const logs = [];
  try {
    const result = await zsign.checkCertificate(filePath, password, (msg) => logs.push(msg));
    res.json({ ok: result.code === 0, ...result, logs: logs.join('') });
  } catch (e) {
    res.status(500).json({ error: e.message, logs: logs.join('') });
  }
});

router.post('/upload-ipa', upload.single('ipa'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const dest = path.join(config.distDir, req.file.originalname || 'upload.ipa');
  fs.renameSync(req.file.path, dest);
  res.json({ ok: true, path: dest });
});

router.post('/upload-cert', upload.fields([
  { name: 'p12', maxCount: 1 },
  { name: 'provision', maxCount: 1 },
]), (req, res) => {
  const out = {};
  if (req.files?.p12?.[0]) {
    out.p12Path = path.join(config.distDir, 'cert.p12');
    fs.renameSync(req.files.p12[0].path, out.p12Path);
  }
  if (req.files?.provision?.[0]) {
    out.provisionPath = path.join(config.distDir, 'profile.mobileprovision');
    fs.renameSync(req.files.provision[0].path, out.provisionPath);
  }
  res.json({ ok: true, ...out });
});

module.exports = router;
