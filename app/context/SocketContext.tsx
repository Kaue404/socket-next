'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: number;
  text: string;
  user: string;
  timestamp: Date;
}

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  sendMessage: (text: string, user: string) => void;
  typing: string;
  setTyping: (user: string) => void;
  stopTyping: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTypingState] = useState('');

  useEffect(() => {
    const socketInstance = io('http://localhost:3001');
    setSocket(socketInstance);

    socketInstance.on('previous_messages', (previousMessages: Message[]) => {
      setMessages(previousMessages);
    });

    socketInstance.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on('user_typing', (user: string) => {
      setTypingState(user);
    });

    socketInstance.on('user_stop_typing', () => {
      setTypingState('');
    });

    socketInstance.on('connect', () => {
      console.log('Conectado ao servidor Socket.IO');
    });

    socketInstance.on('disconnect', () => {
      console.log('Desconectado do servidor Socket.IO');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendMessage = (text: string, user: string) => {
    if (socket && socket.connected) {
      socket.emit('send_message', { text, user });
    } else {
      console.error('Socket não conectado');
    }
  };

  const setTyping = (user: string) => {
    if (socket && socket.connected) {
      socket.emit('typing', user);
    }
  };

  const stopTyping = () => {
    if (socket && socket.connected) {
      socket.emit('stop_typing');
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        messages,
        sendMessage,
        typing,
        setTyping,
        stopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
