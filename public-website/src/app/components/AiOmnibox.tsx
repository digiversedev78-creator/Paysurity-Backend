"use client";

import { useChat } from '@ai-sdk/react';
import { FormEvent, useState } from 'react';

export default function AiOmnibox() {
  const { messages, sendMessage, status } = useChat();
  const [inputValue, setInputValue] = useState('');
  const isLoading = status === 'submitted' || status === 'streaming';

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: inputValue }] });
    setInputValue('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
      <div className="h-64 sm:h-80 md:h-96 overflow-y-auto p-4 md:p-6 space-y-4 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center opacity-90">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              <span className="text-2xl text-white font-bold">P</span>
            </div>
            {/* The backend will inject 'isLoggedIn' via JWT. We mock it here for the UI */}
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
              {/* If Logged In: "Welcome back to your Command Center." */}
              Get 0% Markup Merchant Services Today.
            </h3>
            <p className="text-sm text-zinc-300 max-w-md font-medium">
              {/* If Logged In: "How can I assist you with your operations today?" */}
              Enter your business details below to instantly unlock wholesale processing rates, free hardware, and a customized AI operating system.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 border border-white/10 text-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.parts.map((p: any) => p.type === 'text' ? p.text : '').join('')}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-black/60 relative overflow-hidden">
        {/* Subtle animated gradient background for the input area */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 opacity-50 animate-pulse"></div>
        
        <form onSubmit={onSubmit} className="relative flex items-center gap-3">
          <div className="relative flex-grow group">
            {/* Glowing border effect on focus */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition duration-500"></div>
            
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="E.g., I run a 3-location Sports Bar and want to stop paying 2.9% on credit cards..."
              className="relative w-full bg-zinc-900/90 border border-white/10 rounded-xl py-4 pl-5 pr-14 text-white placeholder:text-zinc-500 focus:outline-none transition-all shadow-inner"
              disabled={isLoading}
            />
          </div>
          
          {/* Voice WebRTC Toggle Button */}
          <button
            type="button"
            className="relative p-4 rounded-xl border border-white/10 bg-zinc-800/80 hover:bg-zinc-700/80 transition-all flex items-center justify-center shadow-lg group"
            title="Speak to PaySurity AI"
          >
            {/* Simulated Voice Pulse */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-xl opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Submit Text Button */}
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 disabled:grayscale text-white rounded-xl transition-all shadow-lg flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
