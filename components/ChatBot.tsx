import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles, User as UserIcon, ConciergeBell, History, Plus, MessageCircle, ChevronLeft, Trash2, MoreHorizontal, Maximize2, Minimize2, ArrowRight } from 'lucide-react';
import { ChatMessage, Conversation, User } from '../types';
import { generateRAGResponse } from '../services/geminiService';
import { saveChatMessage, logQueryAnalytics, createConversation, getUserConversations, getChatHistory, deleteConversation } from '../services/chatService';
import { supabase } from '../services/supabaseClient';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // History State
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, view, isOpen, isExpanded]);

  const [dbStatus, setDbStatus] = useState<'checking' | 'ready' | 'missing' | 'error'>('checking');
  
  // Load User and Conversations on Mount
  useEffect(() => {
    console.log("ChatBot Mounted");
    const init = async () => {
      // Check if tables exist
      try {
        const { error } = await supabase.from('chat_history').select('id').limit(1);
        if (error) {
          if (error.code === '42P01') setDbStatus('missing');
          else setDbStatus('error');
        } else {
          setDbStatus('ready');
        }
      } catch (e) {
        setDbStatus('error');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("ChatBot User:", user.id);
        setCurrentUser({
          id: user.id,
          email: user.email || '',
          username: user.email?.split('@')[0] || 'Guest'
        });
        loadConversations(user.id);
      }
    };
    init();
  }, [isOpen]);

  const loadConversations = async (userId: string) => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    try {
      const convs = await getUserConversations(userId);
      setConversations(convs);
      if (!convs) {
        setHistoryError('Failed to load history.');
      } else if (convs.length === 0) {
        // No error, just empty
      }
    } catch (err: any) {
        console.error("Error loading conversations", err);
        setHistoryError(err.message || 'Failed to load history');
    } finally {
        setIsLoadingHistory(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([{
      id: 'welcome',
      role: 'model',
      text: 'Good day! Welcome to Grand Horizon Hotel. I am your virtual concierge. How may I assist you with your stay today?',
      timestamp: Date.now(),
    }]);
    setView('chat');
    if (window.innerWidth < 640) setIsExpanded(true); // Auto expand on mobile for better view
  };

  const handleSelectConversation = async (conv: Conversation) => {
    setIsLoading(true);
    setMessages([]); // Clear current messages to show loader
    setCurrentConversationId(conv.id);
    try {
        const history = await getChatHistory(conv.id);
        if (history && history.length > 0) {
          setMessages(history);
        } else {
          // If history is empty, show the welcome message for this conversation
          setMessages([{
            id: 'welcome-back',
            role: 'model',
            text: `Welcome back! This conversation is ready for your questions.`,
            timestamp: Date.now(),
          }]);
        }
        setView('chat');
    } catch (err: any) {
        console.error("Failed to load chat history", err);
        setMessages([{
          id: 'error-history',
          role: 'model',
          text: `I had trouble loading your previous messages. Please try selecting it again.`,
          timestamp: Date.now(),
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (showDeleteConfirm === id) {
      // Confirm delete
      await deleteConversation(id);
      setConversations(prev => prev ? prev.filter(c => c.id !== id) : []);
      setShowDeleteConfirm(null);
      if (currentConversationId === id) {
        handleNewChat();
      }
    } else {
      setShowDeleteConfirm(id);
    }
  };

  const groupConversations = (convs: Conversation[]) => {
    const groups: { [key: string]: Conversation[] } = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Older': []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    if (!convs) return groups;

    convs.forEach(c => {
      const date = new Date(c.updated_at);
      if (date >= today) {
        groups['Today'].push(c);
      } else if (date >= yesterday) {
        groups['Yesterday'].push(c);
      } else if (date >= lastWeek) {
        groups['Previous 7 Days'].push(c);
      } else {
        groups['Older'].push(c);
      }
    });

    return groups;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !currentUser) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Add user message to UI immediately
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let activeChatId = currentConversationId;

    try {
      // Create conversation if it doesn't exist
      if (!activeChatId) {
        // Use first 30 chars as title
        const title = userText.slice(0, 30) + (userText.length > 30 ? '...' : '');
        const newConv = await createConversation(currentUser.id, title);
        if (newConv) {
          activeChatId = newConv.id;
          setCurrentConversationId(newConv.id);
          loadConversations(currentUser.id); // Refresh sidebar
        } else {
          console.error("Failed to create conversation");
        }
      }

      if (activeChatId) {
        const { error: saveError } = await saveChatMessage(activeChatId, 'user', userText);
        if (saveError) {
          console.warn("Message not saved to history:", saveError);
        }
      }

      // Prepare history for API - Include NEW message plus previous ones
    const historyForApi = [
      ...messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      { role: 'user', parts: [{ text: userText }] }
    ];

    const responseText = await generateRAGResponse(userText, historyForApi);

      if (activeChatId) {
        const { error: saveError } = await saveChatMessage(activeChatId, 'model', responseText);
        if (saveError) {
          console.warn("AI response not saved to history:", saveError);
        }
        // Optimistic update for sidebar title/timestamp if needed, 
        // but re-fetching is safer for sync
        loadConversations(currentUser.id);
      }
      
      await logQueryAnalytics(userText, responseText);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `I apologize, but I had trouble processing that: ${error.message || 'Unknown error'}. Please try again.`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedConversations = groupConversations(conversations || []);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  // Auto-expand by default for this "one-page" request
  useEffect(() => {
    if (isOpen) setIsExpanded(true);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full shadow-2xl hover:bg-slate-800 hover:scale-110 transition-all duration-300"
        >
          <MessageSquare className="w-7 h-7 text-amber-400" />
          {messages.length > 1 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 border-2 border-white rounded-full animate-bounce"></span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full h-full max-w-7xl sm:rounded-2xl shadow-2xl flex overflow-hidden ring-1 ring-black/5 dark:ring-white/10 animate-in zoom-in-95 duration-300 transition-colors duration-300">
        
        {/* SIDEBAR - History */}
        <div className={`
          ${view === 'history' ? 'flex' : 'hidden'} lg:flex
          flex-col w-full lg:w-80 bg-slate-900 dark:bg-slate-950 text-white shrink-0 border-r border-slate-800 dark:border-slate-800 transition-colors duration-300
        `}>
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-amber-400 p-1.5 rounded-lg">
                <ConciergeBell className="w-4 h-4 text-slate-900" />
              </div>
              <h3 className="font-serif font-medium text-amber-50">History</h3>
            </div>
            <button 
              onClick={handleNewChat}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-amber-400"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
            {isLoadingHistory ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
              </div>
            ) : historyError ? (
              <div className="text-center p-4 text-red-400">
                <p className="text-xs">{historyError}</p>
                <button onClick={() => currentUser && loadConversations(currentUser.id)} className="mt-2 text-[10px] underline hover:text-white">Retry</button>
              </div>
            ) : (
              Object.entries(groupedConversations).map(([group, convs]) => (
                convs.length > 0 && (
                  <div key={group} className="space-y-1">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">{group}</h4>
                    {convs.map(conv => (
                      <div 
                        key={conv.id}
                        onClick={() => {
                          handleSelectConversation(conv);
                          if (window.innerWidth < 1024) setView('chat');
                        }}
                        className={`
                          group relative flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer text-sm
                          ${currentConversationId === conv.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                        `}
                      >
                        <MessageSquare className="w-4 h-4 shrink-0 opacity-50" />
                        <span className="flex-1 truncate">{conv.title || 'New Chat'}</span>
                        <button
                          onClick={(e) => handleDeleteConversation(e, conv.id)}
                          className={`opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ))
            )}
          </div>

          {/* User Profile in Sidebar */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                  {currentUser?.username?.charAt(0).toUpperCase() || 'G'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentUser?.username || 'Guest'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{currentUser?.email}</p>
                </div>
             </div>
          </div>
        </div>

        {/* MAIN AREA - Chat */}
        <div className={`
          ${view === 'chat' ? 'flex' : 'hidden lg:flex'}
          flex-1 flex-col bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-300
        `}>
          
          {/* Header */}
          <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shadow-sm relative z-10 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView('history')}
                className="lg:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="bg-slate-900 dark:bg-slate-800 p-2 rounded-xl">
                <ConciergeBell className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-900 dark:text-white leading-tight">AI Concierge</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-medium">Grand Horizon Hotel</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleNewChat}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-gray-100 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 p-4 sm:p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 transition-colors duration-300">
            {dbStatus === 'missing' && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 mb-6 animate-in slide-in-from-top-4 duration-500">
                <div className="flex gap-3">
                  <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-xl shrink-0 h-fit">
                    <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">Database Setup Incomplete</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1 leading-relaxed">
                      To see your chat history, please run the SQL setup commands provided in your documentation. Until then, conversations won't be saved after you refresh.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isLoading && messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                <p className="text-slate-500 dark:text-slate-400 font-serif">Retrieving our conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 px-4">
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center animate-bounce-subtle">
                  <Sparkles className="w-10 h-10 text-amber-500" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">How can I assist you today?</h1>
                  <p className="text-slate-500 dark:text-slate-400">I can help you with restaurant bookings, amenities, local tips, and more.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {[
                    "What are the pool hours?",
                    "Book a table at The Azure",
                    "How do I access the gym?",
                    "Tell me about the spa"
                  ].map(suggestion => (
                    <button 
                      key={suggestion}
                      onClick={() => {
                        setInputValue(suggestion);
                      }}
                      className="p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all text-left group"
                    >
                      {suggestion}
                      <ArrowRight className="w-4 h-4 float-right opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-8 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`
                        w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm
                        ${msg.role === 'user' 
                          ? 'bg-slate-900 dark:bg-slate-800 text-amber-400' 
                          : 'bg-amber-400 dark:bg-amber-500 text-slate-900'}
                      `}>
                        {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <ConciergeBell className="w-4 h-4" />}
                      </div>
                      <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`
                          px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-sm
                          ${msg.role === 'user' 
                            ? 'bg-slate-900 dark:bg-slate-800 text-white dark:text-amber-50 rounded-tr-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-gray-100 dark:border-slate-700 rounded-tl-none'
                          }
                        `}>
                           {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-2 font-medium px-2">
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start animate-in fade-in duration-300">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-3xl rounded-tl-none px-6 py-4 shadow-sm">
                         <div className="flex gap-1.5 items-center">
                           <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                           <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                           <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                         </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 sm:p-8 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="relative group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full pl-6 pr-16 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 rounded-2xl hover:bg-amber-500 dark:hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all shadow-md active:scale-95"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
              <div className="text-center mt-4">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Your luxury experience, powered by AI. Check details for accuracy.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};


export default ChatBot;