
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('Admin: Connected to WebSocket server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Admin: Disconnected from WebSocket server');
});

socket.on('connect_error', (err) => {
  console.error('Admin: Socket connection error:', err.message);
});