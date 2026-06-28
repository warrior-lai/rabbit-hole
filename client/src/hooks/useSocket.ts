import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@shared/types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Auto-detect: in production, connect to same origin. In dev, use localhost:3001
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin);

function getSessionToken(): string {
  // sessionStorage (not localStorage) so each browser TAB has its own identity:
  // it survives reloads/reconnects in the same tab (rejoin works) but two tabs of
  // the same browser get distinct tokens — otherwise multiplayer testing in tabs
  // collides identities and kicks players out.
  let token = sessionStorage.getItem('rh-session-token');
  if (!token) {
    try { token = crypto.randomUUID(); } catch { token = Math.random().toString(36).substring(2) + Date.now().toString(36); }
    sessionStorage.setItem('rh-session-token', token);
  }
  return token;
}

export function useSocket() {
  const socketRef = useRef<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const sessionToken = useRef(getSessionToken());
  const wasInRoom = useRef(false);

  const setInRoom = (val: boolean) => { wasInRoom.current = val; };

  // Send a debug report from the browser's perspective. The server forwards it to
  // Discord, so the webhook URL stays out of the public client bundle.
  const reportDebug = (event: string, info: { screen?: string; roomCode?: string; detail?: string } = {}) => {
    socketRef.current?.emit('debug:report', {
      event,
      screen: info.screen,
      roomCode: info.roomCode,
      detail: info.detail,
      sessionToken: sessionToken.current,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    });
  };

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
      socket.emit('session:register', { sessionToken: sessionToken.current });
      // Try to rejoin if we were in a room
      if (wasInRoom.current) {
        socket.emit('room:rejoin', { sessionToken: sessionToken.current });
      }
    });
    socket.on('disconnect', () => setIsConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return { socket: socketRef.current, isConnected, setInRoom, reportDebug };
}
