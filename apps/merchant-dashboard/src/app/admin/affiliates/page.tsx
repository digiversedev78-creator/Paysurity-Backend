'use client';

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';

// Interfaces for data types
interface Affiliate {
  id: string;
  name: string;
  email: string;
  totalClicks: number;
  totalConversions: number;
  totalCommissionsEarned: number;
  currentCommissionRate: number; // Stored as a decimal (e.g., 0.1 for 10%)
  isSuspended: boolean;
  isFraudulent: boolean;
  createdAt: string;
}

interface PayoutRequest {
  id: string;
  affiliateId: string;
  affiliateName: string;
  amount: number;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
}

// Generic API Response interface
interface ApiResponse<T> {
  data: T;
  error?: string;
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [newCommissionRateInput, setNewCommissionRateInput] = useState<string>('');

  // Function to fetch all necessary affiliate data
  const fetchAffiliateData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch affiliates
      const affiliatesRes = await fetch('/api/admin/affiliates');
      const affiliatesData: ApiResponse<Affiliate[]> = await affiliatesRes.json();
      if (!affiliatesRes.ok || affiliatesData.error) {
        throw new Error(affiliatesData.error || 'Failed to fetch affiliates.');
      }
      setAffiliates(affiliatesData.data);

      // Fetch pending payout requests
      const payoutsRes = await fetch('/api/admin/affiliates/payout-requests');
      const payoutsData: ApiResponse<PayoutRequest[]> = await payoutsRes.json();
      if (!payoutsRes.ok || payoutsData.error) {
        throw new Error(payoutsData.error || 'Failed to fetch payout requests.');
      }
      setPayoutRequests(payoutsData.data.filter(req => req.status === 'pending'));

    } catch (err: any) {
      console.error('Error fetching affiliate data:', err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to load data on component mount
  useEffect(() => {
    fetchAffiliateData();
  }, [fetchAffiliateData]); // Dependency array ensures effect runs only when fetchAffiliateData changes

  // Handler for updating commission rate
  const handleUpdateCommissionRate = async (affiliateId: string) => {
    const newRateDecimal = parseFloat(newCommissionRateInput) / 100; // Convert percentage input to decimal

    // Validate rate: should be between 0 and 1 (representing 0% to 100%)
    if (isNaN(newRateDecimal) || newRateDecimal < 0 || newRateDecimal > 1) {
      alert('Commission rate must be between 0% and 100%.');
      return;
    }

    if (!confirm(`Are you sure you want to override the commission rate for this affiliate to ${(newRateDecimal * 100).toFixed(1)}%?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/affiliates/${affiliateId}/commission-rate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newRateDecimal }),
      });

      const data: ApiResponse<Affiliate> = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update commission rate.');
      }

      setAffiliates(prevAffiliates =>
        prevAffiliates.map(aff =>
          aff.id === affiliateId ? { ...aff, currentCommissionRate: data.data.currentCommissionRate } : aff
        )
      );
      setEditingRateId(null); // Exit editing mode
      setNewCommissionRateInput(''); // Clear input
      alert('Commission rate updated successfully.');
    } catch (err: any) {
      console.error('Error updating commission rate:', err);
      alert(`Error updating commission rate: ${err.message}`);
    }
  };

  // Handler for toggling affiliate suspension status
  const handleToggleSuspension = async (affiliateId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    if (!confirm(`Are you sure you want to ${newStatus ? 'suspend' : 'unsuspend'} this affiliate?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/affiliates/${affiliateId}/suspend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isSuspended: newStatus }),
      });

      const data: ApiResponse<Affiliate> = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update suspension status.');
      }

      setAffiliates(prevAffiliates =>
        prevAffiliates.map(aff =>
          aff.id === affiliateId ? { ...aff, isSuspended: data.data.isSuspended } : aff
        )
      );
      alert(`Affiliate ${newStatus ? 'suspended' : 'unsuspended'} successfully.`);
    } catch (err: any) {
      console.error('Error updating suspension status:', err);
      alert(`Error updating suspension status: ${err.message}`);
    }
  };

  // Handler for clearing fraud flag
  const handleClearFraudFlag = async (affiliateId: string) => {
    if (!confirm('Are you sure you want to clear the fraud flag for this affiliate?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/affiliates/${affiliateId}/fraud-flag`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFraudulent: false }),
      });

      const data: ApiResponse<Affiliate> = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to clear fraud flag.');
      }

      setAffiliates(prevAffiliates =>
        prevAffiliates.map(aff =>
          aff.id === affiliateId ? { ...aff, isFraudulent: data.data.isFraudulent } : aff
        )
      );
      alert('Fraud flag cleared successfully.');
    } catch (err: any) {
      console.error('Error clearing fraud flag:', err);
      alert(`Error clearing fraud flag: ${err.message}`);
    }
  };

  // Handler for approving/denying payout requests
  const handlePayoutRequest = async (requestId: string, action: 'approved' | 'denied') => {
    if (!confirm(`Are you sure you want to ${action} this payout request?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/affiliates/payout-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action }),
      });

      const data: ApiResponse<PayoutRequest> = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Failed to ${action} payout request.`);
      }

      setPayoutRequests(prevRequests =>
        prevRequests.filter(req => req.id !== requestId) // Remove the processed request
      );
      alert(`Payout request ${action} successfully.`);
    } catch (err: any) {
      console.error(`Error ${action} payout request:`, err);
      alert(`Error ${action} payout request: ${err.message}`);
    }
  };

  const fraudulentAffiliates = affiliates.filter(aff => aff.isFraudulent);
  const nonFraudulentAffiliates = affiliates.filter(aff => !aff.isFraudulent);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Affiliate Management</h1>

      {loading && <p className="text-blue-500">Loading affiliate data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* Fraud Flag Queue */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Fraud Flag Queue</h2>
            {fraudulentAffiliates.length === 0 ? (
              <p>No affiliates currently flagged as fraudulent.</p>
            ) : (
              <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Affiliate Name
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraudulentAffiliates.map(aff => (
                      <tr key={aff.id} className="hover:bg-gray-50">
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {aff.name}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {aff.email}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <button
                            onClick={() => handleClearFraudFlag(aff.id)}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                          >
                            Clear Flag
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* All Affiliates List */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">All Affiliates</h2>
            {nonFraudulentAffiliates.length === 0 ? (
              <p>No non-fraudulent affiliates found.</p>
            ) : (
              <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Conversions
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Commissions
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Commission Rate
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonFraudulentAffiliates.map(aff => (
                      <tr key={aff.id} className="hover:bg-gray-50">
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {aff.name}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {aff.email}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {aff.totalClicks}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {aff.totalConversions}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          ${aff.totalCommissionsEarned.toFixed(2)}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {editingRateId === aff.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={newCommissionRateInput}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCommissionRateInput(e.target.value)}
                                className="w-20 p-1 border rounded text-xs"
                                placeholder={(aff.currentCommissionRate * 100).toFixed(1)}
                              />
                              <span>%</span>
                              <button
                                onClick={() => handleUpdateCommissionRate(aff.id)}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => { setEditingRateId(null); setNewCommissionRateInput(''); }}
                                className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span>{(aff.currentCommissionRate * 100).toFixed(1)}%</span>
                              <button
                                onClick={() => { setEditingRateId(aff.id); setNewCommissionRateInput((aff.currentCommissionRate * 100).toFixed(1)); }}
                                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded text-xs"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${aff.isSuspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {aff.isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <button
                            onClick={() => handleToggleSuspension(aff.id, aff.isSuspended)}
                            className={`font-bold py-1 px-3 rounded text-xs ${aff.isSuspended ? 'bg-green-500 hover:bg-green-700' : 'bg-red-500 hover:bg-red-700'} text-white`}
                          >
                            {aff.isSuspended ? 'Unsuspend' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pending Payout Requests */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Pending Payout Requests</h2>
            {payoutRequests.length === 0 ? (
              <p>No pending payout requests.</p>
            ) : (
              <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Affiliate
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Requested At
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutRequests.map(req => (
                      <tr key={req.id} className="hover:bg-gray-50">
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {req.affiliateName}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          ${req.amount.toFixed(2)}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          {new Date(req.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm space-x-2">
                          <button
                            onClick={() => handlePayoutRequest(req.id, 'approved')}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handlePayoutRequest(req.id, 'denied')}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                          >
                            Deny
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}