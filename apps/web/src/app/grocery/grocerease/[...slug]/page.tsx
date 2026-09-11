'use client';
import React from 'react';
import { usePathname } from 'next/navigation';

export default function GrocerySubPage() {
  const pathname = usePathname();
  const slug = pathname.split('/').pop() || 'Module';
  const properName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-8 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl mx-auto flex items-center justify-center text-4xl">🧺</div>
        <h1 className="text-3xl font-black text-white tracking-tight">GrocerEase / {properName}</h1>
        <p className="text-zinc-500 leading-relaxed">
          The {properName} management interface for GrocerEase is currently under active development as part of Sprint 2.
        </p>
        <div className="pt-8 border-t border-zinc-800">
          <a href="/grocery/grocerease" className="text-emerald-500 font-bold hover:underline">← Return to Storefront</a>
        </div>
      </div>
    </div>
  );
}
