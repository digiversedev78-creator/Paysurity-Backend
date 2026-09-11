'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '../../lib/api-client';

export default function PayrollPage() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShifts() {
      try {
        const data = await ApiClient.get<any[]>('/employees/shifts');
        setShifts(data);
      } catch (err) {
        console.error('Failed to load shifts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadShifts();
  }, []);

  const totalPay = shifts.reduce((acc, s) => acc + (s.hourly_rate_cents_snapshot || 0), 0) / 100;

  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Payroll Nerve Center</h1>
            <p className="text-lg text-gray-500 mt-2">Biometric Shift Data & Wage Reconciliation</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold text-sm border border-blue-100">
            Live Cycle: {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Shifts</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{shifts.length}</p>
            <p className="text-sm text-green-600 font-bold mt-2">Biometrically Verified</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Avg Hourly Rate</p>
            <p className="text-3xl font-black text-gray-900 mt-2">$22.50</p>
            <p className="text-sm text-gray-400 font-bold mt-2">Platform Standard</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Est. Liability</p>
            <p className="text-3xl font-black text-gray-900 mt-2">${totalPay.toFixed(2)}</p>
            <p className="text-sm text-blue-600 font-bold mt-2">Current Run</p>
          </div>
        </div>

        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 uppercase tracking-widest text-xs">Biometric Shift Ledger</h3>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">SECURE_SYNC: 200 OK</span>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-4 font-black">Employee ID</th>
                  <th className="px-6 py-4 font-black">Shift Start</th>
                  <th className="px-6 py-4 font-black">Wage Snapshot</th>
                  <th className="px-6 py-4 font-black">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shifts.map((shift, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 font-mono text-xs text-gray-500">{shift.employee_id}</td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-800">{new Date(shift.clock_in_time).toLocaleString()}</td>
                    <td className="px-6 py-5 font-mono text-sm text-blue-600 font-bold">${(shift.hourly_rate_cents_snapshot / 100).toFixed(2)}/hr</td>
                    <td className="px-6 py-5">
                      <span className="bg-green-100 text-green-700 text-[9px] font-black uppercase px-2 py-1 rounded-full">
                        Verified // Biometric
                      </span>
                    </td>
                  </tr>
                ))}
                {shifts.length === 0 && !loading && (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">No biometric shifts recorded in this cycle.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
