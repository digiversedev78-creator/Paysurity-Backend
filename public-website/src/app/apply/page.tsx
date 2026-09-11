import React from 'react';
import MultiStepForm from '../../components/merchant-onboarding/MultiStepForm';

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] bg-gradient-to-br from-[#0A0A0A] via-[#111827] to-[#0A0A0A] py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Aesthetic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Join PaySurity Today
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Experience the next generation of merchant processing. Apply in minutes and get approved instantly.
        </p>
      </div>

      <div className="relative z-10">
        <MultiStepForm />
      </div>
    </main>
  );
}
