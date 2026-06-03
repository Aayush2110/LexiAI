import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ChatAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from '@/components/lexi/MessageBubble';

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  documents?: Array<{
    filename: string;
    file_size: number;
    file_type: string;
    uploaded_at: string;
  }>;
}

interface ChatContextType {
  // State
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadChats: () => Promise<void>;
  createChat: () => Promise<string | null>;
  selectChat: (id: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateChatTitle: (id: string, title: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  clearCurrentChat: () => void;
  refreshChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Load all chats from backend
  const loadChats = useCallback(async () => {
    if (!isAuthenticated) {
      // Clear chats if not authenticated
      setChats([]);
      setCurrentChat(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await ChatAPI.listChats();
      
      const formattedChats: Chat[] = response.chats.map((chat: any) => ({
        id: chat.session_id,
        title: chat.title,
        messages: [],
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
        messageCount: chat.message_count,
      }));
      
      setChats(formattedChats);
      console.log('[ChatContext] Loaded chats:', formattedChats.length);
    } catch (err: any) {
      console.error('[ChatContext] Error loading chats:', err);
      setError(err?.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create new chat
  const createChat = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ChatAPI.createChat();
      
      const newChat: Chat = {
        id: response.session_id,
        title: 'New Chat',
        messages: [],
        createdAt: response.created_at,
        updatedAt: response.created_at,
        messageCount: 0,
      };
      
      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      
      console.log('[ChatContext] Created new chat:', response.session_id);
      return response.session_id;
    } catch (err: any) {
      console.error('[ChatContext] Error creating chat:', err);
      setError(err?.message || 'Failed to create chat');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Select and load a chat
  const selectChat = useCallback(async (id: string) => {
    try {
      console.log('[ChatContext] Selecting chat:', id);
      setLoading(true);
      setError(null);
      
      const chat = await ChatAPI.getChat(id);
      console.log('[ChatContext] Received chat data:', chat);
      
      const loadedMessages: Message[] = chat.messages.map((msg: any) => ({
        id: crypto.randomUUID(),
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.timestamp).getTime(),
      }));
      
      // Load documents for this session
      let documents = [];
      try {
        const docsResponse = await ChatAPI.getDocuments(id);
        documents = docsResponse.documents || [];
        console.log('[ChatContext] Loaded documents:', documents);
      } catch (err) {
        console.log('[ChatContext] No documents found for this chat');
      }
      
      const loadedChat: Chat = {
        id: chat.session_id,
        title: chat.title,
        messages: loadedMessages,
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
        messageCount: loadedMessages.length,
        documents: documents,
      };
      
      console.log('[ChatContext] Setting current chat:', loadedChat);
      setCurrentChat(loadedChat);
      console.log('[ChatContext] Successfully loaded chat:', id, 'with', loadedMessages.length, 'messages and', documents.length, 'documents');
    } catch (err: any) {
      console.error('[ChatContext] Error loading chat:', err);
      setError(err?.message || 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  }, []);

  // Add message to current chat (optimistic update)
  const addMessage = useCallback((message: Message) => {
    setCurrentChat(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, message],
        messageCount: prev.messages.length + 1,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // Update chat title
  const updateChatTitle = useCallback(async (id: string, title: string) => {
    try {
      await ChatAPI.updateTitle(id, title);
      
      setChats(prev => prev.map(chat => 
        chat.id === id ? { ...chat, title } : chat
      ));
      
      if (currentChat?.id === id) {
        setCurrentChat(prev => prev ? { ...prev, title } : null);
      }
      
      console.log('[ChatContext] Updated chat title:', id, title);
    } catch (err: any) {
      console.error('[ChatContext] Error updating title:', err);
      setError(err?.message || 'Failed to update title');
    }
  }, [currentChat]);

  // Delete chat
  const deleteChat = useCallback(async (id: string) => {
    try {
      await ChatAPI.deleteChat(id);
      
      setChats(prev => prev.filter(chat => chat.id !== id));
      
      if (currentChat?.id === id) {
        setCurrentChat(null);
      }
      
      console.log('[ChatContext] Deleted chat:', id);
    } catch (err: any) {
      console.error('[ChatContext] Error deleting chat:', err);
      setError(err?.message || 'Failed to delete chat');
    }
  }, [currentChat]);

  // Clear current chat
  const clearCurrentChat = useCallback(() => {
    setCurrentChat(null);
  }, []);

  // Refresh chats list
  const refreshChats = useCallback(async () => {
    await loadChats();
  }, [loadChats]);

  // Load chats on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('[ChatContext] User authenticated, loading chats for:', user.email);
      loadChats();
    } else {
      console.log('[ChatContext] User not authenticated, clearing chats');
      setChats([]);
      setCurrentChat(null);
    }
  }, [isAuthenticated, user?.id, loadChats]);

  const value: ChatContextType = {
    chats,
    currentChat,
    loading,
    error,
    loadChats,
    createChat,
    selectChat,
    addMessage,
    updateChatTitle,
    deleteChat,
    clearCurrentChat,
    refreshChats,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
