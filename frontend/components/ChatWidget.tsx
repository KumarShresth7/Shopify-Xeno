'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import apiClient from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Xeno, your AI Data Analyst. \n\nI can analyze your **Revenue**, **Orders**, and **Customer Trends**. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await apiClient.post('/chat', { message: userMsg });
      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error connecting to the data server." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      

      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[550px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in ring-1 ring-black/5">
          
    
          <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                <Sparkles size={18} className="text-yellow-300" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Xeno Intelligence</h3>
                <p className="text-[10px] opacity-80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/> 
                  Live Store Data
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>


          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/30 scroll-smooth" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
            
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-secondary border-border' 
                      : 'bg-primary/10 border-primary/20'
                  }`}>
                    {m.role === 'user' ? <User size={14} className="text-foreground" /> : <Bot size={16} className="text-primary" />}
                  </div>

      
                  <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed overflow-hidden ${
                    m.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-card text-foreground border border-border rounded-tl-sm'
                  }`}>
            
                    {m.role === 'assistant' ? (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                   
                          p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({children}) => <span className="font-bold text-primary dark:text-blue-400">{children}</span>,
                          ul: ({children}) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="pl-1">{children}</li>,
                          code: ({children}) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{m.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

    
            {loading && (
              <div className="flex justify-start w-full animate-in fade-in duration-300">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex-shrink-0 flex items-center justify-center">
                    <Bot size={16} className="text-primary" />
                  </div>
                  <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-10">
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </div>


          <form onSubmit={handleSend} className="p-3 bg-card border-t border-border">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about revenue, orders, trends..."
                className="w-full pl-4 pr-12 py-3 bg-muted/50 border border-transparent focus:border-primary/20 focus:bg-background rounded-xl text-sm outline-none transition-all placeholder:text-muted-foreground shadow-inner"
              />
              <button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="text-[10px] text-center text-muted-foreground mt-2 font-medium">
              Powered by Google Gemini 2.5 Flash
            </div>
          </form>
        </div>
      )}


      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-primary/25 active:scale-95 ${
          isOpen 
            ? 'bg-destructive text-destructive-foreground rotate-90' 
            : 'bg-primary text-primary-foreground'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}