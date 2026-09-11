'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function DemoViewerContent() {
  const searchParams = useSearchParams();
  const [activeDemo, setActiveDemo] = useState('/legacy-demos/Chicago_Retail_Demo.html');

  useEffect(() => {
    const demoId = searchParams.get('demo');
    if (demoId === 'chicago') setActiveDemo('/legacy-demos/Chicago_Retail_Demo.html');
    if (demoId === 'ashiana') setActiveDemo('/legacy-demos/AshianaCollections_Demo.html');
    if (demoId === 'grand') setActiveDemo('/legacy-demos/GrandTobacco_Demo.html');
    if (demoId === 'house') setActiveDemo('/legacy-demos/HouseOfBiryani_Demo.html');
    if (demoId === 'tawakkul') setActiveDemo('/legacy-demos/Tawakkul_Demo.html');
  }, [searchParams]);

  const demos = [
    { id: 'chicago', name: 'Chicago Retail', path: '/legacy-demos/Chicago_Retail_Demo.html' },
    { id: 'ashiana', name: 'Ashiana Collections', path: '/legacy-demos/AshianaCollections_Demo.html' },
    { id: 'grand', name: 'Grand Tobacco', path: '/legacy-demos/GrandTobacco_Demo.html' },
    { id: 'house', name: 'House of Biryani', path: '/legacy-demos/HouseOfBiryani_Demo.html' },
    { id: 'tawakkul', name: 'Tawakkul', path: '/legacy-demos/Tawakkul_Demo.html' },
  ];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: '#050505', color: '#fff', fontFamily: "'Inter', sans-serif"
    }}>
      {/* Top Navigation Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 md:h-[60px] md:py-0 border-b border-white/10 bg-[#0f1419]/70 backdrop-blur-md shrink-0 z-10 gap-3">
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          <Link href="/" className="flex items-center gap-1 text-gray-400 no-underline text-sm font-semibold px-3 py-1.5 bg-white/5 rounded-md border border-white/10 shrink-0">
            ← Back to Hub
          </Link>
          <div className="w-[1px] h-6 bg-white/10 shrink-0 hidden md:block"></div>
          <h1 className="m-0 text-sm md:text-base font-extrabold tracking-wider text-emerald-500 uppercase shrink-0">
            Original Concept Demos (v1)
          </h1>
        </div>

        {/* Demo Selector */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          {demos.map(d => (
            <button
              key={d.id}
              onClick={() => setActiveDemo(d.path)}
              style={{
                background: activeDemo === d.path ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                border: `1px solid ${activeDemo === d.path ? 'rgba(16, 185, 129, 0.4)' : 'transparent'}`,
                color: activeDemo === d.path ? '#34d399' : '#9ca3af',
              }}
              className="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all shrink-0 whitespace-nowrap"
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Iframe Viewer */}
      <div style={{ flex: 1, backgroundColor: '#000', position: 'relative' }}>
        <iframe
          src={activeDemo}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            display: 'block'
          }}
          title="Legacy V1 Demo"
        />
      </div>
    </div>
  );
}

export default function V1DemoViewer() {
  return (
    <Suspense fallback={<div style={{background: '#050505', height: '100vh'}} />}>
      <DemoViewerContent />
    </Suspense>
  );
}
