import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { ParkingSimulator } from './simulator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../../frontend/dist');
const port = Number(process.env.PORT) || 4000;
const startedAt = Date.now();

const app = express();
const simulator = new ParkingSimulator();

app.use(cors());
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/lot', (_req, res) => res.json(simulator.snapshot()));
app.get('/api/spots', (_req, res) => res.json(simulator.spots));
app.get('/api/stats', (_req, res) => res.json(simulator.stats()));
app.get('/api/zones', (_req, res) => res.json(simulator.snapshot().zones));
app.get('/api/activity', (_req, res) => res.json(simulator.activity));

app.post('/api/spots/:id/reserve', (req, res) => {
  const result = simulator.reserve(req.params.id);
  res.status(result.status).json(result.error ? { error: result.error } : result.spot);
});

app.post('/api/spots/:id/release', (req, res) => {
  const result = simulator.release(req.params.id);
  res.status(result.status).json(result.error ? { error: result.error } : result.spot);
});

const inquiries = [];
app.post('/api/inquiries', (req, res) => {
  const { name, email, message } = req.body ?? {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email and message are required' });
  }

  const inquiry = { id: `INQ-${String(inquiries.length + 1).padStart(4, '0')}`, name, email, message, receivedAt: new Date().toISOString() };
  inquiries.push(inquiry);
  res.status(201).json({ ok: true, id: inquiry.id });
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found' }));

app.use(express.static(distDir));
app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'snapshot', ...simulator.snapshot() }));

  socket.on('message', (raw) => {
    try {
      const command = JSON.parse(raw.toString());
      if (command.type === 'reserve' || command.type === 'release') {
        const result = simulator[command.type](String(command.id ?? ''));
        socket.send(JSON.stringify({ type: 'command-result', ok: result.status === 200, result }));
      }
    } catch {
      socket.send(JSON.stringify({ type: 'error', error: 'Invalid command' }));
    }
  });
});

simulator.subscribe((payload) => {
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(JSON.stringify(payload));
  }
});

server.listen(port, () => {
  simulator.start();
  console.log(`SmartPark backend ready at http://localhost:${port}`);
  console.log(`Live sensor stream at ws://localhost:${port}/ws`);
});
