/**
 * Socket.IO Server untuk Multiplayer Real-Time + Global Updates
 * Menangani room management, matchmaking, game state synchronization, dan real-time leaderboard
 */

class SocketServer {
  constructor(httpServer) {
    const { Server } = require('socket.io');
    
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      // Performance optimizations
      pingTimeout: 60000, // 60 seconds
      pingInterval: 25000, // 25 seconds
      upgradeTimeout: 10000, // 10 seconds
      maxHttpBufferSize: 1e6, // 1 MB
      allowUpgrades: true,
      perMessageDeflate: false, // Disable compression for speed
      httpCompression: false // Disable HTTP compression for speed
    });
    
    this.rooms = new Map(); // Store active game rooms
    this.playerSockets = new Map(); // Map socket.id to player info
    this.globalClients = new Set(); // Clients subscribed to global updates
    
    this.setupHandlers();
    this.startGlobalUpdateBroadcast();
    this.startRoomCleanup(); // Clean up old rooms
    console.log('🎮 Socket.IO Multiplayer + Real-Time Server initialized');
  }

  setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log('✅ Player connected:', socket.id);
      
      // Send immediate connection confirmation
      socket.emit('connected', { 
        socketId: socket.id,
        timestamp: Date.now()
      });

      // ===== SUBSCRIBE TO GLOBAL UPDATES =====
      socket.on('subscribe-global-updates', () => {
        this.globalClients.add(socket.id);
        console.log(`📡 Client ${socket.id} subscribed to global updates`);
      });

      socket.on('unsubscribe-global-updates', () => {
        this.globalClients.delete(socket.id);
        console.log(`📡 Client ${socket.id} unsubscribed from global updates`);
      });

      // ===== CREATE ROOM =====
      socket.on('create-room', ({ gameType, playerName }) => {
        const roomId = this.generateRoomId();
        const room = {
          id: roomId,
          gameType,
          players: [{ 
            id: socket.id, 
            name: playerName,
            ready: true 
          }],
          state: 'waiting',
          gameState: null,
          createdAt: Date.now()
        };
        
        this.rooms.set(roomId, room);
        this.playerSockets.set(socket.id, { roomId, playerName });
        socket.join(roomId);
        
        console.log(`🎯 Room created: ${roomId} by ${playerName}`);
        socket.emit('room-created', { roomId, room });
      });

      // ===== JOIN ROOM =====
      socket.on('join-room', ({ roomId, playerName }) => {
        const room = this.rooms.get(roomId);
        
        if (!room) {
          socket.emit('error', { message: 'Room tidak ditemukan' });
          return;
        }
        
        if (room.players.length >= 2) {
          socket.emit('error', { message: 'Room sudah penuh' });
          return;
        }
        
        if (room.state !== 'waiting') {
          socket.emit('error', { message: 'Game sudah dimulai' });
          return;
        }
        
        room.players.push({ 
          id: socket.id, 
          name: playerName,
          ready: true 
        });
        room.state = 'playing';
        
        this.playerSockets.set(socket.id, { roomId, playerName });
        socket.join(roomId);
        
        console.log(`🚪 ${playerName} joined room ${roomId}`);
        
        // Notify both players that game is starting
        this.io.to(roomId).emit('game-start', { 
          room,
          players: room.players
        });
      });

      // ===== PLAYER MOVE =====
      socket.on('player-move', ({ roomId, move, gameState }) => {
        const room = this.rooms.get(roomId);
        if (!room) return;
        
        // Update room game state
        room.gameState = gameState;
        
        // Broadcast move to other player in room
        socket.to(roomId).emit('opponent-move', { 
          move,
          gameState,
          playerId: socket.id
        });
        
        console.log(`🎮 Move in room ${roomId}:`, move);
      });

      // ===== GAME OVER =====
      socket.on('game-over', ({ roomId, winner, finalScore }) => {
        const room = this.rooms.get(roomId);
        if (!room) return;
        
        room.state = 'finished';
        
        this.io.to(roomId).emit('game-finished', {
          winner,
          finalScore,
          players: room.players
        });
        
        console.log(`🏁 Game finished in room ${roomId}, winner: ${winner}`);
        
        // Broadcast global leaderboard update
        this.broadcastGlobalUpdate('leaderboard-updated', { 
          gameType: room.gameType,
          winner,
          finalScore 
        });
      });

      // ===== SCORE SUBMITTED =====
      socket.on('score-submitted', ({ gameId, playerName, score }) => {
        console.log(`📊 Score submitted: ${playerName} - ${score} in ${gameId}`);
        
        // Broadcast to all subscribed clients
        this.broadcastGlobalUpdate('new-score', {
          gameId,
          playerName,
          score,
          timestamp: Date.now()
        });
      });

      // ===== REMATCH REQUEST =====
      socket.on('request-rematch', ({ roomId }) => {
        const room = this.rooms.get(roomId);
        if (!room) return;
        
        socket.to(roomId).emit('rematch-requested', {
          requestedBy: socket.id
        });
        
        console.log(`🔄 Rematch requested in room ${roomId}`);
      });

      // ===== REMATCH ACCEPT =====
      socket.on('accept-rematch', ({ roomId }) => {
        const room = this.rooms.get(roomId);
        if (!room) return;
        
        room.state = 'playing';
        room.gameState = null;
        
        this.io.to(roomId).emit('rematch-accepted', {
          room
        });
        
        console.log(`✅ Rematch accepted in room ${roomId}`);
      });

      // ===== CHAT MESSAGE =====
      socket.on('chat-message', ({ roomId, message }) => {
        const playerInfo = this.playerSockets.get(socket.id);
        if (!playerInfo) return;
        
        socket.to(roomId).emit('chat-message', {
          playerName: playerInfo.playerName,
          message,
          timestamp: Date.now()
        });
      });

      // ===== LEAVE ROOM =====
      socket.on('leave-room', ({ roomId }) => {
        this.handlePlayerLeave(socket, roomId);
      });

      // ===== DISCONNECT =====
      socket.on('disconnect', () => {
        console.log('❌ Player disconnected:', socket.id);
        
        // Remove from global updates
        this.globalClients.delete(socket.id);
        
        const playerInfo = this.playerSockets.get(socket.id);
        if (playerInfo) {
          this.handlePlayerLeave(socket, playerInfo.roomId);
        }
      });
    });
  }

  /**
   * Broadcast global updates to subscribed clients
   */
  broadcastGlobalUpdate(event, data) {
    this.globalClients.forEach(socketId => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit(event, data);
      } else {
        // Clean up disconnected clients
        this.globalClients.delete(socketId);
      }
    });
  }

  /**
   * Start periodic global updates broadcast
   */
  startGlobalUpdateBroadcast() {
    // Broadcast stats every 5 seconds
    setInterval(() => {
      const stats = {
        activeRooms: this.rooms.size,
        connectedPlayers: this.playerSockets.size,
        globalClients: this.globalClients.size,
        timestamp: Date.now()
      };
      
      this.broadcastGlobalUpdate('stats-update', stats);
    }, 5000);
    
    console.log('📡 Global update broadcast started (5s interval)');
  }

  /**
   * Clean up old/abandoned rooms
   */
  startRoomCleanup() {
    setInterval(() => {
      const now = Date.now();
      const ROOM_TIMEOUT = 30 * 60 * 1000; // 30 minutes
      
      let cleanedCount = 0;
      this.rooms.forEach((room, roomId) => {
        // Remove rooms older than 30 minutes in waiting state
        if (room.state === 'waiting' && (now - room.createdAt) > ROOM_TIMEOUT) {
          this.rooms.delete(roomId);
          cleanedCount++;
        }
        // Remove finished rooms older than 5 minutes
        else if (room.state === 'finished' && (now - room.createdAt) > 5 * 60 * 1000) {
          this.rooms.delete(roomId);
          cleanedCount++;
        }
      });
      
      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} old rooms`);
      }
    }, 60000); // Check every minute
    
    console.log('🧹 Room cleanup started (1 minute interval)');
  }

  handlePlayerLeave(socket, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    const playerInfo = this.playerSockets.get(socket.id);
    const playerName = playerInfo?.playerName || 'Unknown';
    
    // Notify other players
    socket.to(roomId).emit('player-left', { 
      playerName,
      playerId: socket.id
    });
    
    // Remove player from room
    room.players = room.players.filter(p => p.id !== socket.id);
    
    // Delete room if empty
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      console.log(`🗑️ Room ${roomId} deleted (empty)`);
    } else {
      room.state = 'waiting';
      console.log(`👋 ${playerName} left room ${roomId}`);
    }
    
    // Cleanup
    this.playerSockets.delete(socket.id);
    socket.leave(roomId);
  }

  generateRoomId() {
    // Generate 6-character room code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
    let roomId = '';
    for (let i = 0; i < 6; i++) {
      roomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure uniqueness
    if (this.rooms.has(roomId)) {
      return this.generateRoomId();
    }
    
    return roomId;
  }

  // Get active rooms count
  getActiveRoomsCount() {
    return this.rooms.size;
  }

  // Get total connected players
  getConnectedPlayersCount() {
    return this.playerSockets.size;
  }

  // Get global clients count
  getGlobalClientsCount() {
    return this.globalClients.size;
  }
}

module.exports = SocketServer;
