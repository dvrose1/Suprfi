// ABOUTME: Chat provider component that manages chat widget state
// ABOUTME: Allows teaser and other components to open the chat

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import ChatWidget from './ChatWidget';

interface ChatContextType {
  openChat: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <ChatContext.Provider value={{ openChat }}>
      {children}
      <ChatWidgetWithState isOpen={isOpen} setIsOpen={setIsOpen} />
    </ChatContext.Provider>
  );
};

// Modified ChatWidget that accepts external state
const ChatWidgetWithState: React.FC<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
  return <ChatWidgetControlled isOpen={isOpen} setIsOpen={setIsOpen} />;
};

export default ChatProvider;

// We need to create a controlled version of the chat widget
import ChatWidgetControlled from './ChatWidgetControlled';
