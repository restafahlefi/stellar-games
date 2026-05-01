/**
 * Socket.IO Client Service untuk Multiplayer
 * Menangani koneksi real-time dengan server
 */

import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.currentRoom = null;
  }

  /**
   * Connect to Socket.IO server
   * Returns a promise that resolves when connected
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        console.log('✅ Already connected to multiplayer server');
        this.connected = true;
        resolve(this.socket);
        return;
      }
      
      const serverUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
      
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'], // Try WebSocket first (faster)
        reconnection: true,
        reconnectionDelay: 500, // Faster reconnection
        reconnectionAttempts: 3,
        timeout: 5000, // Connection timeout
        forceNew: false, // Reuse existing connection
        upgrade: true, // Allow transport upgrade
        rememberUpgrade: true // Remember successful upgrade
      });

      // Connection success
      this.socket.on('connect', () => {
        console.log('✅ Connected to multiplayer server:', this.socket.id);
        this.connected = true;
        resolve(this.socket);
      });

      // Connection error
      this.socket.on('connect_error', (error) => {
        console.error('🔴 Connection error:', error.message);
        this.connected = false;
        reject(error);
      });

      // Disconnection
      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);
        this.connected = false;
      });

      // Timeout fallback
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('Connection timeout'));
        }
      }, 5000);
    });
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.currentRoom = null;
      console.log('👋 Disconnected from multiplayer server');
    }
  }

  /**
   * Create a new game room
   */
  createRoom(gameType, playerName) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('create-room', { gameType, playerName });
      
      this.socket.once('room-created', ({ roomId, room }) => {
        this.currentRoom = roomId;
        console.log('🎯 Room created:', roomId);
        resolve({ roomId, room });
      });

      this.socket.once('error', ({ message }) => {
        reject(new Error(message));
      });
    });
  }

  /**
   * Join an existing room
   */
  joinRoom(roomId, playerName) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('join-room', { roomId: roomId.toUpperCase(), playerName });
      
      this.socket.once('game-start', ({ room, players }) => {
        this.currentRoom = roomId;
        console.log('🚪 Joined room:', roomId);
        resolve({ room, players });
      });

      this.socket.once('error', ({ message }) => {
        reject(new Error(message));
      });
    });
  }

  /**
   * Send player move to opponent
   */
  sendMove(roomId, move, gameState = null) {
    if (!this.socket) return;
    
    this.socket.emit('player-move', { 
      roomId, 
      move,
      gameState 
    });
  }

  /**
   * Listen for opponent moves
   */
  onOpponentMove(callback) {
    if (!this.socket) return;
    this.socket.on('opponent-move', callback);
  }

  /**
   * Send game over notification
   */
  sendGameOver(roomId, winner, finalScore) {
    if (!this.socket) return;
    
    this.socket.emit('game-over', {
      roomId,
      winner,
      finalScore
    });
  }

  /**
   * Listen for game finished event
   */
  onGameFinished(callback) {
    if (!this.socket) return;
    this.socket.on('game-finished', callback);
  }

  /**
   * Request rematch
   */
  requestRematch(roomId) {
    if (!this.socket) return;
    this.socket.emit('request-rematch', { roomId });
  }

  /**
   * Listen for rematch requests
   */
  onRematchRequested(callback) {
    if (!this.socket) return;
    this.socket.on('rematch-requested', callback);
  }

  /**
   * Accept rematch
   */
  acceptRematch(roomId) {
    if (!this.socket) return;
    this.socket.emit('accept-rematch', { roomId });
  }

  /**
   * Listen for rematch accepted
   */
  onRematchAccepted(callback) {
    if (!this.socket) return;
    this.socket.on('rematch-accepted', callback);
  }

  /**
   * Send chat message
   */
  sendChatMessage(roomId, message) {
    if (!this.socket) return;
    this.socket.emit('chat-message', { roomId, message });
  }

  /**
   * Listen for chat messages
   */
  onChatMessage(callback) {
    if (!this.socket) return;
    this.socket.on('chat-message', callback);
  }

  /**
   * Listen for player left event
   */
  onPlayerLeft(callback) {
    if (!this.socket) return;
    this.socket.on('player-left', callback);
  }

  /**
   * Leave current room
   */
  leaveRoom() {
    if (!this.socket || !this.currentRoom) return;
    
    this.socket.emit('leave-room', { roomId: this.currentRoom });
    this.currentRoom = null;
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  /**
   * Get connection status
   */
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  /**
   * Get current room ID
   */
  getCurrentRoom() {
    return this.currentRoom;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
