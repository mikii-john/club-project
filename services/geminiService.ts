import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { supabase } from "./supabaseClient";

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Generates embeddings for a given text.
 */
export const generateEmbedding = async (text: string, taskType: TaskType = TaskType.RETRIEVAL_DOCUMENT): Promise<number[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[GeminiService] Missing VITE_GEMINI_API_KEY');
    throw new Error('Missing Gemini API Key');
  }
  
  console.log(`[GeminiService] Generating embedding (${text.length} chars) | Type: ${taskType}`);
  
  try {
    // According to diagnostics, gemini-embedding-001 is available on v1beta
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    
    const result = await model.embedContent({
      content: { role: 'user', parts: [{ text }] },
      taskType: taskType,
      outputDimensionality: 768,
    } as any);
    
    if (!result.embedding || !result.embedding.values) {
      throw new Error('Gemini API returned empty embedding');
    }

    console.log('[GeminiService] Embedding successful (768d)');
    return result.embedding.values;
  } catch (err) {
    console.error('[GeminiService] Embedding generation failed:', err);
    throw err;
  }
};

/**
 * Performs a vector similarity search in Supabase.
 */
export const findRelevantSections = async (queryEmbedding: number[], userId: string, matchCount: number = 3) => {
  console.log(`[GeminiService] Searching vector DB for user: ${userId}`);
  
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.3, // Lowered slightly for better recall
    match_count: matchCount,
    p_user_id: userId // Matching the user's recent change
  });

  if (error) {
    console.error('[GeminiService] Supabase RPC error:', error);
    // Try without p_user_id as fallback if the DB doesn't have it yet
    console.log('[GeminiService] Retrying search without p_user_id filter...');
    const { data: fallbackData, error: fallbackError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: matchCount
    });
    
    if (fallbackError) {
      console.error('[GeminiService] Fallback search failed:', fallbackError);
      return [];
    }
    return fallbackData || [];
  }

  console.log(`[GeminiService] Search successful. Found ${data?.length || 0} match(es).`);
  return data || [];
};

/**
 * Generates a context-aware response using RAG.
 */
export const generateRAGResponse = async (userQuery: string, history: any[] = []): Promise<string> => {
  console.log(`[GeminiService] Processing RAG query: "${userQuery}"`);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // 1. Generate Query Embedding
    const queryEmbedding = await generateEmbedding(userQuery, TaskType.RETRIEVAL_QUERY);

    // 2. Retrieve Relevant Context
    const relevantDocs = await findRelevantSections(queryEmbedding, user.id);
    const context = relevantDocs.map((doc: any) => `Content: ${doc.content}`).join('\n\n---\n\n');

    console.log('[GeminiService] Retrieved context length:', context.length);

    const systemInstruction = `
      You are "Horizon", the virtual concierge for the Grand Horizon Hotel.
      You have access to the following Hotel Knowledge Base to answer guest questions.
      
      Rules:
      1. ONLY answer based on the provided Knowledge Base.
      2. If the answer is not in the Knowledge Base, politely suggest they contact the Front Desk at +1 (555) 019-9999.
      3. Be warm, polite, and sophisticated, typical of a luxury hotel concierge.
      4. Use emojis occasionally (e.g., 🏨, 🍹, 🌴) to feel welcoming.
      5. Keep answers concise but helpful.
      
      === KNOWLEDGE BASE START ===
      ${context || "No specific information found in knowledge base."}
      === KNOWLEDGE BASE END ===
    `;

    // 3. Generate Response
    // Using gemini-flash-latest which was confirmed available on v1beta
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      systemInstruction: systemInstruction 
    });

    console.log('[GeminiService] Starting chat session...');
    
    // Robust history mapping:
    // 1. Map to Gemini format
    // 2. Filter out empty messages
    // 3. Ensure history starts with 'user' (Gemini requirement)
    let formattedHistory = history.map(h => {
      const text = h.parts && h.parts[0] ? h.parts[0].text : (h.text || '');
      return {
        role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
        parts: [{ text }]
      };
    }).filter(h => h.parts[0].text);

    // Find the first 'user' message index
    const firstUserIndex = formattedHistory.findIndex(h => h.role === 'user');
    if (firstUserIndex !== -1) {
      formattedHistory = formattedHistory.slice(firstUserIndex);
    } else {
      formattedHistory = [];
    }

    const chat = model.startChat({
      history: formattedHistory,
    });

    console.log('[GeminiService] Sending message...');
    const result = await chat.sendMessage(userQuery);
    const response = await result.response;
    const finalContent = response.text();
    console.log('[GeminiService] Response received.');
    return finalContent;

  } catch (error: any) {
    console.error("[GeminiService] generateRAGResponse failed:", error);
    return "I apologize, I am having trouble connecting to the concierge service right now. Please contact the front desk.";
  }
};