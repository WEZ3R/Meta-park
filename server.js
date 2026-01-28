const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Global state
let isShutdown = false;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/status', (req, res) => {
  res.json({ isShutdown });
});

app.post('/updateState', (req, res) => {
  const { shutdown } = req.body;

  if (typeof shutdown !== 'boolean') {
    return res.status(400).json({ error: 'shutdown must be a boolean' });
  }

  isShutdown = shutdown;
  console.log(`[Server] isShutdown updated to: ${isShutdown}`);
  res.json({ success: true, isShutdown });
});

// Serve React static files in production
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all handler for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET  /status      - Get current shutdown state`);
  console.log(`  POST /updateState - Update shutdown state`);
});
