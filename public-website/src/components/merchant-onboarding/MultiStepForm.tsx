'use client';

import React, { useState } from 'react';
import ProgressTracker from './ProgressTracker';

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    legalBusinessName: '',
    vertical: 'RETAIL',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    selectedPlanCode: 'STANDARD',
  });
  const [loading, setLoading] = useState(false);

  const totalSteps = 4;

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.continueUrl || '/success';
      } else {
        console.error('Submission failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
      <ProgressTracker currentStep={currentStep} totalSteps={totalSteps} />
      
      <div className="mt-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Business Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300">Legal Business Name</label>
              <input 
                name="legalBusinessName"
                type="text" 
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                value={formData.legalBusinessName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Vertical</label>
              <select
                name="vertical"
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                value={formData.vertical}
                onChange={handleChange}
              >
                <option value="RETAIL">Retail</option>
                <option value="RESTAURANT">Restaurant</option>
                <option value="ECOMMERCE">E-commerce</option>
                <option value="GROCERY">Grocery</option>
                <option value="SALON">Salon</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Owner Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">First Name</label>
                <input 
                  name="ownerFirstName"
                  type="text" 
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                  value={formData.ownerFirstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Last Name</label>
                <input 
                  name="ownerLastName"
                  type="text" 
                  className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                  value={formData.ownerLastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Email Address</label>
              <input 
                name="ownerEmail"
                type="email" 
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                value={formData.ownerEmail}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Phone Number</label>
              <input 
                name="ownerPhone"
                type="tel" 
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                value={formData.ownerPhone}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Select a Plan</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300">Plan Code</label>
              <select
                name="selectedPlanCode"
                className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-800 text-white px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                value={formData.selectedPlanCode}
                onChange={handleChange}
              >
                <option value="STANDARD">Standard (2.9% + 30¢)</option>
                <option value="PREMIUM">Premium (2.5% + 15¢)</option>
                <option value="ENTERPRISE">Enterprise (Custom)</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Review & Submit</h2>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-300">Business Name: <span className="text-white font-medium">{formData.legalBusinessName}</span></p>
              <p className="text-gray-300">Vertical: <span className="text-white font-medium">{formData.vertical}</span></p>
              <p className="text-gray-300">Owner: <span className="text-white font-medium">{formData.ownerFirstName} {formData.ownerLastName}</span></p>
              <p className="text-gray-300">Email: <span className="text-white font-medium">{formData.ownerEmail}</span></p>
              <p className="text-gray-300">Plan: <span className="text-white font-medium">{formData.selectedPlanCode}</span></p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1 || loading}
          className="px-6 py-2 rounded-md font-medium text-gray-300 bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        {currentStep < totalSteps ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)]"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-md font-medium text-white bg-green-600 hover:bg-green-700 transition-colors shadow-[0_0_15px_rgba(22,163,74,0.5)] flex items-center"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        )}
      </div>
    </div>
  );
}
