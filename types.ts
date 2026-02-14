export interface User {
  id: string;
  username: string;
  email: string;
  isAdminAuthenticated?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface KnowledgeDocument {
  id: string;
  title?: string;
  filename: string;
  content?: string; // Content is now in chunks, but we might want it here for UI display summary
  createdAt: number;
  status: 'pending' | 'processing' | 'indexed' | 'active' | 'error';
  user_id: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  summary?: string;
  created_at: string;
  updated_at: string;
}
