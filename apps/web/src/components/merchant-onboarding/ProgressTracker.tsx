'use client';

import React from 'react';

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressTracker({ currentStep, totalSteps }: ProgressTrackerProps) {
  return (
    <div className="relative pt-1">
      <div className="flex mb-2 items-center justify-between">
        <div>
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-400 bg-blue-900/50 border border-blue-500/30">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold inline-block text-blue-400">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
      </div>
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-800 border border-gray-700">
        <div 
          style={{ width: `${(currentStep / totalSteps) * 100}%` }} 
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 ease-out"
        ></div>
      </div>
    </div>
  );
}
