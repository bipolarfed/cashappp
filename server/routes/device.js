const express = require('express');
const device = require('../services/device');

const router = express.Router();

router.get('/list', async (_req, res) => {
  try {
    const result = await device.listDevices();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/tools', async (_req, res) => {
  res.json({ tools: await device.checkTools() });
});

router.post('/install', async (req, res) => {
  const { ipaPath, udid } = req.body;
  if (!ipaPath) return res.status(400).json({ error: 'ipaPath required' });
  try {
    const result = await device.installIpa(ipaPath, udid);
    res.json({ ok: result.code === 0, ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
