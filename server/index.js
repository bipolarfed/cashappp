const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');
const config = require('./config');

const filesRouter = require('./routes/files');
const buildRouter = require('./routes/build');
const signRouter = require('./routes/sign');
const deviceRouter = require('./routes/device');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/files', filesRouter);
app.use('/api/build', buildRouter);
app.use('/api/sign', signRouter);
app.use('/api/device', deviceRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, version: '1.0.0' });
});

// Broadcast helper for live logs
function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'connected', message: 'Skibidi IPA Builder ready' }));

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'ping') ws.send(JSON.stringify({ type: 'pong' }));
    } catch {
      // ignore
    }
  });
});

app.set('broadcast', broadcast);

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

server.listen(config.port, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║   Skibidi IPA Builder                    ║');
  console.log(`  ║   http://localhost:${config.port}                  ║`);
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
  console.log('  Connect your iPhone via USB, then open the URL above.');
  console.log('');
});

module.exports = { app, server, broadcast };
