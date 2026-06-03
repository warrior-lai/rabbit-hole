import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@shared/types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Auto-detect: in production, connect to same origin. In dev, use localhost:3001
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);

export function useSocket() {
  const socketRef = useRef<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket: TypedSocket = io(SERVER_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      pingInterval: 25000,
      pingTimeout: 60000,
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return { socket: socketRef.current, isConnected };
}
