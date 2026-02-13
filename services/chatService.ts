import { supabase } from './supabaseClient';
import { ChatMessage, Conversation } from '../types';

export const createConversation = async (userId: string, title: string = 'New Conversation'): Promise<Conversation | null> => {
  const { data, error } = await supabase
    .from('conversations')
    .insert([
      { 
        user_id: userId, 
        title: title 
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
  return data;
};

export const getUserConversations = async (userId: string): Promise<Conversation[] | null> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return null;
  }
  return data || [];
};

export const deleteConversation = async (conversationId: string) => {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    console.error('Error deleting conversation:', error);
  }
};

export const updateConversationTitle = async (conversationId: string, title: string) => {
  const { error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (error) {
    console.error('Error updating conversation title:', error);
  }
};

export const saveChatMessage = async (chatId: string, role: 'user' | 'model', text: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[ChatService] No user found for saveChatMessage');
    return { error: 'Not authenticated' };
  }

  console.log(`[ChatService] Saving message to ${chatId}: ${role}`);
  const { error } = await supabase
    .from('chat_history')
    .insert([
      { 
        chat_id: chatId,
        user_id: user.id,
        role, 
        content: text 
      }
    ]);

  if (error) {
    console.error('[ChatService] Error saving chat message:', error.message, error.code);
    return { error };
  }
  
  // Update conversation timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId);
    
  return { success: true };
};

export const logQueryAnalytics = async (query: string, response: string, metadata: any = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from('analytics')
    .insert([
      { 
        user_id: user?.id,
        query, 
        response, 
        metadata 
      }
    ]);

  if (error) {
    console.error('[ChatService] Error logging analytics:', error.message);
  }
};

export const getChatHistory = async (chatId: string): Promise<ChatMessage[]> => {
  console.log(`[ChatService] Fetching history for ${chatId}`);
  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[ChatService] Error fetching chat history:', error.message, error.code);
    throw error; // Throw so the component can catch and show error
  }

  console.log(`[ChatService] Fetched ${data?.length || 0} messages.`);
  return (data || []).map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'model',
    text: msg.content,
    timestamp: new Date(msg.created_at).getTime(),
  }));
};
