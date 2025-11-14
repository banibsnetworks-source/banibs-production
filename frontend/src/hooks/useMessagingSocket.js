// frontend/src/hooks/useMessagingSocket.js
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Phase 3.2 - WebSocket hook for real-time messaging
 * 
 * Provides real-time features:
 * - Live message delivery
 * - Typing indicators
 * - Presence (online/offline)
 * - Read receipts
 */
export function useMessagingSocket(options = {}) {
  const {
    conversationId,
    onMessageCreated,
    onTyping,
    onPresence,
    onReadReceipt,
  } = options;

  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const heartbeatRef = useRef(null);

  const sendRaw = useCallback((data) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify(data));
  }, []);

  const sendMessage = useCallback(
    (payload) => {
      sendRaw({ type: "message.send", payload });
    },
    [sendRaw]
  );

  const sendTyping = useCallback(
    (isTyping, cid) => {
      const conversation_id = cid || conversationId;
      if (!conversation_id) return;
      sendRaw({
        type: isTyping ? "typing.start" : "typing.stop",
        payload: { conversation_id },
      });
    },
    [sendRaw, conversationId]
  );

  const markRead = useCallback(
    (cid) => {
      const conversation_id = cid || conversationId;
      if (!conversation_id) return;
      sendRaw({
        type: "message.read",
        payload: { conversation_id },
      });
    },
    [sendRaw, conversationId]
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Determine WebSocket URL based on backend URL
    const backendUrl = process.env.REACT_APP_BACKEND_URL || window.location.origin;
    const wsProtocol = backendUrl.startsWith('https') ? 'wss:' : 'ws:';
    const wsHost = backendUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const wsUrl = `${wsProtocol}//${wsHost}/ws/messaging?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🔌 WebSocket connected");
      setConnected(true);
      
      // heartbeat every 20s
      heartbeatRef.current = setInterval(() => {
        sendRaw({ type: "presence.heartbeat", payload: {} });
      }, 20000);
      
      // join conversation if specified
      if (conversationId) {
        sendRaw({ type: "join", payload: { conversation_id: conversationId } });
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "message.created" && onMessageCreated) {
          onMessageCreated(data.payload);
        } else if (data.type === "typing" && onTyping) {
          onTyping(data.payload);
        } else if (data.type === "presence" && onPresence) {
          onPresence(data.payload);
        } else if (data.type === "read_receipt" && onReadReceipt) {
          onReadReceipt(data.payload);
        }
      } catch (e) {
        console.warn("Unknown WS message", e);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      setConnected(false);
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      ws.close();
    };
  }, [conversationId, onMessageCreated, onTyping, onPresence, onReadReceipt, sendRaw]);

  // join new conversation if conversationId changes
  useEffect(() => {
    if (connected && conversationId && wsRef.current) {
      sendRaw({ type: "join", payload: { conversation_id: conversationId } });
    }
  }, [conversationId, connected, sendRaw]);

  return {
    connected,
    sendMessage,
    sendTyping,
    markRead,
  };
}
