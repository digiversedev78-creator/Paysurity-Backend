'use client';
import React from 'react';

export default function ComingSoon({ 
  title = "Feature Coming Soon", 
  description = "We are working hard to bring this amazing feature to you. Our team is putting the final touches on it. Stay tuned!" 
}: { 
  title?: string, 
  description?: string 
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-4 sm:p-8 text-center animate-fade-up">
      <div className="relative w-full max-w-lg p-8 sm:p-12 rounded-3xl bg-ps-bg-card border border-ps-border shadow-2xl overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-ps-accent opacity-20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-ps-info opacity-20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Icon */}
          <div className="w-24 h-24 mb-8 rounded-full bg-ps-bg-input border border-ps-border flex items-center justify-center shadow-inner">
            <svg className="w-12 h-12 text-ps-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
            </svg>
          </div>
          
          {/* Text Content */}
          <h2 className="text-3xl font-bold text-ps-text mb-4 tracking-tight">
            {title}
          </h2>
          <p className="text-ps-text-muted mb-10 text-base leading-relaxed max-w-sm">
            {description}
          </p>
          
          {/* Action Button */}
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-ps-accent text-white font-semibold rounded-full hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl shadow-ps-accent/20"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
