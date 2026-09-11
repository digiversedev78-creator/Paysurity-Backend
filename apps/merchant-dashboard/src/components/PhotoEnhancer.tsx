'use client';

import React from 'react';

export default function PhotoEnhancer({ src, onAccept, onRetake }: { src: string, onAccept: (img: string) => void, onRetake: () => void }) {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col gap-4">
      <h3 className="text-lg font-bold text-white">Photo Preview</h3>
      <img src={src} alt="Preview" className="w-full rounded-xl" />
      <div className="flex gap-4">
        <button onClick={onRetake} className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors">Retake</button>
        <button onClick={() => onAccept(src)} className="flex-1 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors">Accept</button>
      </div>
    </div>
  );
}
