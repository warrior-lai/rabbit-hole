import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { setupSocketHandlers } from './socket/handlers';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingInterval: 25000,
  pingTimeout: 60000,
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', game: 'rabbit-hole' });
});

// Serve static client build - try multiple paths
const possiblePaths = [
  path.join(process.cwd(), 'client/dist'),           // from repo root
  path.join(process.cwd(), '../client/dist'),         // from server/
  path.join(__dirname, '../../client/dist'),           // relative to src
  path.join(__dirname, '../../../client/dist'),        // if compiled to dist/
];

let clientDist = '';
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    clientDist = p;
    console.log(`📂 Serving client from: ${p}`);
    break;
  }
}

if (clientDist) {
  app.use(express.static(clientDist));
} else {
  console.warn('⚠️ Client dist not found! Tried:', possiblePaths);
}

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`⚡ Player connected: ${socket.id}`);
  setupSocketHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`💀 Player disconnected: ${socket.id}`);
  });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (_req, res) => {
  if (clientDist) {
    const indexPath = path.join(clientDist, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Client not built. Run: cd client && npm run build');
    }
  } else {
    res.status(404).send('Client not found. Check build configuration.');
  }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`\n🐇 Rabbit Hole server running on port ${PORT}`);
  console.log(`⚡ WebSocket ready\n`);
});

// Keep Render free tier alive (ping every 4 minutes)
setInterval(() => {
  fetch(`http://localhost:${PORT}/api/health`).catch(() => {});
}, 4 * 60 * 1000);
