/**
 * Web Chat Widget Component
 * 
 * Embeddable chat widget that connects to the backend WebSocket server
 * Provides real-time messaging with AI and booking capabilities
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import './WebChatWidget.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface WebChatWidgetProps {
  botId: string;
  widgetToken: string;
  apiBase?: string;
  theme?: {
    primaryColor?: string;
    botName?: string;
    greeting?: string;
  };
}

interface SessionData {
  sessionId: string;
  jwt: string;
  wsUrl: string;
  theme?: any;
  greeting?: string;
}

export function WebChatWidget({
  botId,
  widgetToken,
  apiBase = 'http://localhost:3000',
  theme = {},
}: WebChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Initialize refs with explicit null to satisfy TypeScript (useRef requires an initial value)
  const reconnectTimeoutRef = useRef<number | null>(null);
  const heartbeatIntervalRef = useRef<number | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session
  const initializeSession = useCallback(async () => {
    try {
      const response = await fetch(`${apiBase}/api/webview/${botId}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify({
          token: widgetToken,
          pageUrl: window.location.href,
          metadata: {
            userAgent: navigator.userAgent,
            referrer: document.referrer,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();

      const sessionData: SessionData = {
        sessionId: data.sessionId,
        jwt: data.jwt,
        wsUrl: data.wsUrl || `${apiBase.replace('http', 'ws')}/api/webview/ws`,
        theme: data.theme,
        greeting: data.greeting,
      };

      setSession(sessionData);

      // Save to localStorage
      localStorage.setItem(`webchat_session_${botId}`, JSON.stringify({
        sessionId: sessionData.sessionId,
        jwt: sessionData.jwt,
        lastConnectedAt: new Date().toISOString(),
      }));

      // Add greeting message if provided
      if (sessionData.greeting && messages.length === 0) {
        setMessages([{
          id: 'greeting',
          text: sessionData.greeting,
          sender: 'bot',
          timestamp: new Date(),
          status: 'sent',
        }]);
      }

      return sessionData;
    } catch (error) {
      console.error('Error initializing session:', error);
      return null;
    }
  }, [apiBase, botId, widgetToken, messages.length]);

  // Connect to WebSocket
  const connectWebSocket = useCallback((sessionData: SessionData) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // WebSocket doesn't support custom headers in browsers, so pass JWT in URL
    // sessionData.wsUrl already contains botId and sessionId, just add token
    const wsUrl = `${sessionData.wsUrl}&token=${encodeURIComponent(sessionData.jwt)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);

      // Start heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 25000); // 25 seconds
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setIsConnected(false);

      // Clear heartbeat
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Attempt reconnection after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        if (session) {
          connectWebSocket(session);
        }
      }, 3000);
    };

    wsRef.current = ws;
  }, [botId, session]);

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'connected':
        console.log('Connected to chat server');
        break;

      case 'pong':
        // Heartbeat response
        break;

      case 'bot_message':
        setMessages(prev => [...prev, {
          id: data.id || `bot-${Date.now()}`,
          text: data.text,
          sender: 'bot',
          timestamp: new Date(data.ts || Date.now()),
          status: 'sent',
        }]);
        setIsTyping(false);
        break;

      case 'typing':
        setIsTyping(data.state === 'start');
        break;

      case 'ack':
        // Message acknowledged
        setMessages(prev => prev.map(msg =>
          msg.id === data.id ? { ...msg, status: 'sent' as const } : msg
        ));
        break;

      case 'error':
        console.error('Server error:', data.message);
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          text: `Error: ${data.message}`,
          sender: 'bot',
          timestamp: new Date(),
          status: 'error',
        }]);
        break;

      case 'ended':
        console.log('Session ended');
        setIsConnected(false);
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  };

  // Send message
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const messageId = `user-${Date.now()}`;
    const newMessage: Message = {
      id: messageId,
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Send via WebSocket
    wsRef.current.send(JSON.stringify({
      type: 'user_message',
      id: messageId,
      text: newMessage.text,
      ts: new Date().toISOString(),
    }));
  }, [inputText]);

  // Initialize on mount
  useEffect(() => {
    if (isOpen && !session) {
      initializeSession().then(sessionData => {
        if (sessionData) {
          connectWebSocket(sessionData);
        }
      });
    }
  }, [isOpen, session, initializeSession, connectWebSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  const primaryColor = theme.primaryColor || '#5A3EF0';
  const botName = theme.botName || 'AI Assistant';

  return (
    <>
      {/* Chat Bubble */}
      {!isOpen && (
        <button
          className="webchat-bubble"
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: primaryColor }}
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`webchat-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="webchat-header" style={{ backgroundColor: primaryColor }}>
            <div className="webchat-header-content">
              <div className="webchat-header-title">
                <div className="webchat-status-indicator" style={{
                  backgroundColor: isConnected ? '#10b981' : '#ef4444'
                }} />
                <span>{botName}</span>
              </div>
              <div className="webchat-header-actions">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  aria-label="Minimize"
                >
                  <Minimize2 size={18} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="webchat-messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`webchat-message ${message.sender}`}
                  >
                    <div className="webchat-message-bubble">
                      {message.text}
                      {message.status === 'sending' && (
                        <span className="webchat-message-status">Sending...</span>
                      )}
                      {message.status === 'error' && (
                        <span className="webchat-message-status error">Failed</span>
                      )}
                    </div>
                    <div className="webchat-message-time">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="webchat-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="webchat-input-container">
                <input
                  type="text"
                  className="webchat-input"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!isConnected}
                />
                <button
                  className="webchat-send-button"
                  onClick={sendMessage}
                  disabled={!inputText.trim() || !isConnected}
                  style={{ backgroundColor: primaryColor }}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

