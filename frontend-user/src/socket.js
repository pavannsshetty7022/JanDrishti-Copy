import { io } from 'socket.io-client';

const SOCKET_URL = 'https://jandrishti-community-issue-tracker.onrender.com';

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000
});

socket.on('connect', () => {
  console.log('🟢 Connected to socket:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('🔴 Socket disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.error('❌ Socket error:', err.message);
});
