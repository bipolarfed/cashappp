const express = require('express');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const router = express.Router();

const IGNORE = new Set(['node_modules', '.git', 'build', 'DerivedData', '.zsign_cache', 'dist']);

function safeProjectPath(projectName, relativePath = '') {
  const base = path.resolve(config.projectsDir, projectName);
  const full = path.resolve(base, relativePath || '.');
  if (!full.startsWith(base)) {
    throw new Error('Path traversal blocked');
  }
  return full;
}

function buildTree(dir, rel = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const nodes = [];

  for (const entry of entries) {
    if (IGNORE.has(entry.name)) continue;
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      nodes.push({
        name: entry.name,
        path: relPath,
        type: 'directory',
        children: buildTree(path.join(dir, entry.name), relPath),
      });
    } else {
      nodes.push({ name: entry.name, path: relPath, type: 'file' });
    }
  }

  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return nodes;
}

router.get('/projects', (_req, res) => {
  fs.mkdirSync(config.projectsDir, { recursive: true });
  const projects = fs.readdirSync(config.projectsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !IGNORE.has(d.name))
    .map((d) => d.name);
  res.json({ projects });
});

router.get('/tree/:project', (req, res) => {
  try {
    const dir = safeProjectPath(req.params.project);
    if (!fs.existsSync(dir)) return res.status(404).json({ error: 'Project not found' });
    res.json({ tree: buildTree(dir) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/read/:project/*', (req, res) => {
  try {
    const rel = req.params[0] || '';
    const filePath = safeProjectPath(req.params.project, rel);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) return res.status(400).json({ error: 'Is a directory' });
    res.json({ path: rel, content: fs.readFileSync(filePath, 'utf8') });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/write/:project/*', (req, res) => {
  try {
    const rel = req.params[0] || '';
    const filePath = safeProjectPath(req.params.project, rel);
    const { content } = req.body;
    if (typeof content !== 'string') return res.status(400).json({ error: 'content required' });
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
    res.json({ ok: true, path: rel });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/create/:project', (req, res) => {
  try {
    const { path: relPath, type, content = '' } = req.body;
    const filePath = safeProjectPath(req.params.project, relPath);
    if (type === 'directory') {
      fs.mkdirSync(filePath, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, content, 'utf8');
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/delete/:project/*', (req, res) => {
  try {
    const rel = req.params[0] || '';
    const filePath = safeProjectPath(req.params.project, rel);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    fs.rmSync(filePath, { recursive: true });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
