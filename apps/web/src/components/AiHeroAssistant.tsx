'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';


const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:4001';

type Message = {
  id: string;
  role: 'bot' | 'user';
  text: string;
  showActions?: boolean;
};

export default function AiHeroAssistant() {
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [query]);

  // Scroll to bottom when messages change without scrolling the whole page
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Proactive Chat Initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        {
          id: 'msg-1',
          role: 'bot',
          text: "Hello! I'm PayBot. Are you an existing PaySurity customer, or would you like to see how much you can save on processing fees today?",
          showActions: true,
        }
      ]);
      setIsTyping(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = (text?: string) => {
    const finalQuery = text || query;
    if (!finalQuery.trim() || isTyping) return;
    
    // Add user message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: finalQuery.trim() };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Bot response simulation
    setIsTyping(true);
    setTimeout(() => {
      let botResponse = "I can certainly help you with that! I'm still learning the specifics, but let me quickly route this conversation to one of our payment specialists so they can provide exactly what you need.";
      let lowerQuery = finalQuery.toLowerCase();

      // Simulated LLM Intent Recognition
      if (lowerQuery.includes('price') || lowerQuery.includes('pricing') || lowerQuery.includes('cost') || lowerQuery.includes('fee')) {
        botResponse = "PaySurity offers a 0% markup processing model! Most of our merchants legally pass processing costs to customers through our Cash Discount Program, meaning you keep 100% of your revenue. Would you like to check out our transparent pricing plans?";
      } else if (lowerQuery.includes('merchant') || lowerQuery.includes('service') || lowerQuery.includes('support')) {
        botResponse = "Our Merchant Services provide dedicated 24/7 support, dispute management, and next-day funding. We assign a dedicated account manager to ensure your operations run flawlessly.";
      } else if (lowerQuery.includes('product') || lowerQuery.includes('pos') || lowerQuery.includes('hardware') || lowerQuery.includes('software')) {
        botResponse = "Our product suite includes a Smart POS System, integrated Online Ordering, built-in Payroll, and a powerful Loyalty Engine. We provide all the hardware and software you need in one unified platform.";
      }

      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'bot', 
        text: botResponse 
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    
      <div className="w-full max-w-2xl relative mt-4 flex flex-col items-start text-left">
      
      {/* Chat Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="w-full flex flex-col gap-4 mb-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex flex-col gap-2 max-w-[85%]">
              <div 
                className={`px-6 py-4 font-medium text-base md:text-lg shadow-lg tracking-tight leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#18181b] border border-white/10 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-[#2563eb] text-white rounded-2xl rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
              
              {/* Proactive Action Buttons (only for first message) */}
              {msg.showActions && (
                <div className="flex flex-wrap gap-2 mt-1">
                  <button 
                    onClick={() => window.location.href = `${DASHBOARD_URL}/login`}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-all flex items-center gap-2"
                  >
                    Existing Customer
                  </button>
                  <button 
                    onClick={() => router.push('/savings-estimator')}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center gap-2"
                  >
                    Savings Estimator <span className="text-lg leading-none">✨</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex w-full justify-start animate-in fade-in duration-300">
            <div className="bg-[#2563eb] text-white px-6 py-4 rounded-2xl rounded-tl-sm shadow-lg max-w-[120px] flex items-center justify-center gap-1.5 h-[56px]">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Main Prompt Input Bar */}
      <div className="w-full relative bg-[#18181b]/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] focus-within:border-blue-500/50 focus-within:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-300 p-2 overflow-hidden flex items-end min-h-[64px]">
        
        <div className="flex flex-1 items-end gap-3 p-2 relative z-10">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isTyping ? "PayBot is typing..." : "Type your message here..."}
            className="flex-1 bg-transparent border-none outline-none text-white text-base md:text-lg resize-none min-h-[28px] max-h-[160px] overflow-y-auto placeholder-gray-400"
            rows={1}
            disabled={isTyping}
          />
        </div>

        {/* Action Icons Right Side */}
        <div className="flex items-center gap-2 p-2">
          {/* Submit Button */}
          <button
            onClick={() => handleSend()}
            disabled={!query.trim() || isTyping}
            className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 ${
              query.trim() && !isTyping
                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:scale-105' 
                : 'bg-white/10 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
      </div>
    
  );
}

