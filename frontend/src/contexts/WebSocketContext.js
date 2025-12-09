/**
 * WebSocket Context for Peoples Room Real-Time Updates
 * Phase 4: WebSocket Integration
 * 
 * Provides:
 * - Auto-connecting WebSocket with reconnection logic
 * - Room channel subscriptions
 * - Event listeners for room events
 * - Connection status monitoring
 */

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

const WS_URL = process.env.REACT_APP_BACKEND_URL?.replace('http', 'ws') || 'ws://localhost:8001';
const RECONNECT_DELAY = 3000; // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 10;
const PING_INTERVAL = 30000; // 30 seconds

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const eventListenersRef = useRef(new Map());
  const subscribedRoomsRef = useRef(new Set());

  // Get JWT token
  const getToken = () => {
    return localStorage.getItem('access_token');
  };

  // Connect to WebSocket
  const connect = useCallback(() => {
    const token = getToken();
    
    if (!token) {
      console.warn('🔌 No auth token - WebSocket connection skipped');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔌 WebSocket already connected');
      return;
    }

    try {
      const ws = new WebSocket(`${WS_URL}/api/ws?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setReconnectAttempts(0);
        
        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ action: 'ping' }));
          }
        }, PING_INTERVAL);

        // Resubscribe to rooms
        subscribedRoomsRef.current.forEach(roomId => {
          ws.send(JSON.stringify({
            action: 'subscribe_room',
            room_owner_id: roomId
          }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, data } = message;

          console.log('📨 WebSocket message:', type, data);

          // Call registered event listeners
          if (eventListenersRef.current.has(type)) {
            eventListenersRef.current.get(type).forEach(callback => {
              try {
                callback(data, message);
              } catch (err) {
                console.error(`Error in ${type} listener:`, err);
              }
            });
          }

          // Call wildcard listeners
          if (eventListenersRef.current.has('*')) {
            eventListenersRef.current.get('*').forEach(callback => {
              try {
                callback(data, message);
              } catch (err) {
                console.error('Error in wildcard listener:', err);
              }
            });
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Attempt reconnection
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          console.log(`🔄 Reconnecting in ${RECONNECT_DELAY}ms (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, RECONNECT_DELAY);
        } else {
          console.error('❌ Max reconnection attempts reached');
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
    }
  }, [reconnectAttempts]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  // Subscribe to room updates
  const subscribeToRoom = useCallback((roomOwnerId) => {
    if (!roomOwnerId) return;

    subscribedRoomsRef.current.add(roomOwnerId);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'subscribe_room',
        room_owner_id: roomOwnerId
      }));
      console.log(`📢 Subscribed to room: ${roomOwnerId}`);
    }
  }, []);

  // Unsubscribe from room updates
  const unsubscribeFromRoom = useCallback((roomOwnerId) => {
    if (!roomOwnerId) return;

    subscribedRoomsRef.current.delete(roomOwnerId);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'unsubscribe_room',
        room_owner_id: roomOwnerId
      }));
      console.log(`📢 Unsubscribed from room: ${roomOwnerId}`);
    }
  }, []);

  // Add event listener
  const addEventListener = useCallback((eventType, callback) => {
    if (!eventListenersRef.current.has(eventType)) {
      eventListenersRef.current.set(eventType, new Set());
    }
    eventListenersRef.current.get(eventType).add(callback);

    // Return cleanup function
    return () => {
      const listeners = eventListenersRef.current.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          eventListenersRef.current.delete(eventType);
        }
      }
    };
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const value = {
    isConnected,
    reconnectAttempts,
    connect,
    disconnect,
    subscribeToRoom,
    unsubscribeFromRoom,
    addEventListener
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
