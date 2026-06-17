import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@shared/types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Auto-detect: in production, connect to same origin. In dev, use localhost:3001
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);

function getSessionToken(): string {
  let token = localStorage.getItem('rh-session-token');
  if (!token) {
    try { token = crypto.randomUUID(); } catch { token = Math.random().toString(36).substring(2) + Date.now().toString(36); }
    localStorage.setItem('rh-session-token', token);
  }
  return token;
}

export function useSocket() {
  const socketRef = useRef<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const sessionToken = useRef(getSessionToken());
  const wasInRoom = useRef(false);

  const setInRoom = (val: boolean) => { wasInRoom.current = val; };

  useEffect(() => {
    const socket: TypedSocket = io(SERVER_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 50,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 60000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      // Register session token on every connect
      (socket as any).emit('session:register', { sessionToken: sessionToken.current });
      // Try to rejoin if we were in a room
      if (wasInRoom.current) {
        (socket as any).emit('room:rejoin', { sessionToken: sessionToken.current });
      }
    });
    socket.on('disconnect', () => setIsConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return { socket: socketRef.current, isConnected, setInRoom };
}
