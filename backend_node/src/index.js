const http = require('http');
const app = require('./server');
const SocketServer = require('./infrastructure/socket/SocketServer');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO for multiplayer
const socketServer = new SocketServer(httpServer);

// Make socket server available to routes if needed
app.locals.socketServer = socketServer;

httpServer.listen(PORT, () => {
  console.log(`🎮 Stellar Games API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Socket.IO Multiplayer Server ready`);
});
