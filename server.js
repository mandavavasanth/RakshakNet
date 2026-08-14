require('dotenv').config();
const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const cron = require('node-cron');
const { createClient } = require('./db.js');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'Node.js Express server is running', backend: 'RakshakNet' });
});

wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    ws.on('message', (message) => {
        console.log('Received:', message.toString());
    });
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

// Basic cron job placeholder
cron.schedule('0 0 * * *', () => {
    console.log('Running daily cron job for RakshakNet tasks (e.g., stats aggregation, cleanup)');
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Express server is running on port ${PORT}`);
});
