const express = require('express');
const builder = require('../services/builder');
const config = require('../config');

const router = express.Router();

router.post('/new-project', (req, res) => {
  const { name, bundleId } = req.body;
  if (!name || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
    return res.status(400).json({ error: 'Invalid project name (letters, numbers, underscore)' });
  }
  const bid = bundleId || `com.skibidi.${name.toLowerCase()}`;
  try {
    const dir = builder.createSwiftProject(name, bid);
    res.json({ ok: true, project: name, path: dir, bundleId: bid });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/status/:project', async (req, res) => {
  try {
    const status = await builder.localBuildStatus(req.params.project);
    res.json(status);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/generate-workflow/:project', (req, res) => {
  const { bundleId } = req.body;
  try {
    const path = builder.writeWorkflow(req.params.project, bundleId || `com.skibidi.${req.params.project.toLowerCase()}`);
    res.json({ ok: true, workflowPath: path });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/package-ipa', async (req, res) => {
  const { appPath, outputName } = req.body;
  const logs = [];
  const onLog = (msg) => logs.push(msg);

  try {
    const out = outputName || 'output.ipa';
    const outputIpa = require('path').join(config.distDir, out);
    const result = await builder.packageAppToIpa(appPath, outputIpa, onLog);
    res.json({ ok: true, ...result, logs: logs.join('') });
  } catch (e) {
    res.status(500).json({ error: e.message, logs: logs.join('') });
  }
});

module.exports = router;
