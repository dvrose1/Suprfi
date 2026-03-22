// ABOUTME: Wrapper for ChatTeaser that connects to ChatProvider context
// ABOUTME: Allows the teaser to trigger opening the chat widget

'use client';

import React from 'react';
import ChatTeaser from './ChatTeaser';
import { useChat } from './ChatProvider';

const ChatTeaserWrapper: React.FC = () => {
  const { openChat } = useChat();
  
  return <ChatTeaser onOpenChat={openChat} />;
};

export default ChatTeaserWrapper;
