'use client';
import React, { useEffect, useState } from 'react';

// Define data interfaces based on expected API response
interface LoyaltyData {
  balance: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | string; // Allow dynamic tiers
  tierProgress: {
    currentPoints: number;
    pointsToNextTier: number;
    currentTierThreshold: number; // Points required to enter current tier
    nextTierThreshold: number; // Points required to enter next tier
    nextTierName: string; // Name of the next tier, e.g., 'Silver'
  };
  pointsExpiryNotice: string | null;
  history: LoyaltyTransaction[];
  rewards: Reward[];
}

interface LoyaltyTransaction {
  id: string;
  type: 'EARN' | 'REDEEM' | 'ADJUST';
  points: number;
  description: string;
  date: string; // ISO date string
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  imageUrl?: string;
}

const LoyaltyPage: React.FC = () => {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch loyalty data from the backend
  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Assuming customerId is resolved by the backend from the authenticated user's session/token
      // The frontend doesn't need to explicitly pass customerId here.
      const response = await fetch('/api/loyalty/customer-dashboard');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch loyalty data');
      }
      const data: LoyaltyData = await response.json();
      setLoyaltyData(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      console.error('Error fetching loyalty data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  // Handler for redeeming a reward
  const handleRedeemReward = async (rewardId: string) => {
    if (!window.confirm('Are you sure you want to redeem this reward? This action cannot be undone.')) {
      return;
    }

    try {
      // Send redemption request to the API
      const response = await fetch(`/api/loyalty/rewards/${rewardId}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to redeem reward');
      }

      alert('Reward redeemed successfully! Your loyalty data will now refresh.');
      // Re-fetch all loyalty data to ensure UI is up-to-date with new balance, history, and rewards
      fetchLoyaltyData();
    } catch (err: any) {
      alert(`Error redeeming reward: ${err.message}`);
      console.error('Error redeeming reward:', err);
    }
  };

  // --- UI Rendering ---

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <p>Loading loyalty data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif', color: '#dc3545' }}>
        <h2 style={{ color: '#dc3545' }}>Error</h2>
        <p>{error}</p>
        <button
          onClick={fetchLoyaltyData}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em',
            marginTop: '10px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <p>No loyalty data available. Please try again later.</p>
        <button
          onClick={fetchLoyaltyData}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em',
            marginTop: '10px'
          }}
        >
          Reload
        </button>
      </div>
    );
  }

  // Calculate tier progress bar percentage
  const progressPercentage = loyaltyData.tierProgress.nextTierThreshold > loyaltyData.tierProgress.currentTierThreshold
    ? ((loyaltyData.tierProgress.currentPoints - loyaltyData.tierProgress.currentTierThreshold) /
       (loyaltyData.tierProgress.nextTierThreshold - loyaltyData.tierProgress.currentTierThreshold)) * 100
    : 100; // If already in highest tier or thresholds are same, show 100%

  return (
    <div style={{ padding: '20px', maxWidth: '960px', margin: 'auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h1 style={{ textAlign: 'center', color: '#0056b3', marginBottom: '30px' }}>Your Loyalty Dashboard</h1>

      {/* Balance and Tier */}
      <section style={{ marginBottom: '30px', padding: '25px', border: '1px solid #e0e0e0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff' }}>
        <h2 style={{ marginTop: '0', color: '#0056b3', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>Current Status</h2>
        <p style={{ fontSize: '1.4em', marginBottom: '15px' }}>
          <strong>Points Balance:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>{loyaltyData.balance}</span> points
        </p>
        <p style={{ fontSize: '1.4em', marginBottom: '20px' }}>
          <strong>Your Tier:</strong> <span style={{ background: '#ffc107', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{loyaltyData.tier}</span>
        </p>

        {/* Tier Progress Bar */}
        {loyaltyData.tierProgress.nextTierName ? (
          <div style={{ marginTop: '25px' }}>
            <h3 style={{ fontSize: '1.2em', marginBottom: '10px', color: '#555' }}>
              Tier Progress: <span style={{fontWeight: 'normal'}}>{loyaltyData.tier}</span> → <span style={{fontWeight: 'bold'}}>{loyaltyData.tierProgress.nextTierName}</span>
            </h3>
            <div style={{ background: '#e9ecef', borderRadius: '8px', height: '25px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressPercentage}%`,
                  background: 'linear-gradient(to right, #007bff, #28a745)',
                  height: '100%',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9em',
                  transition: 'width 0.6s ease-out'
                }}
              >
                {Math.round(progressPercentage)}%
              </div>
            </div>
            <p style={{ fontSize: '0.95em', color: '#666', marginTop: '10px' }}>
              You have {loyaltyData.tierProgress.currentPoints} points. You need <strong>{loyaltyData.tierProgress.pointsToNextTier}</strong> more points to reach the {loyaltyData.tierProgress.nextTierName} tier (total {loyaltyData.tierProgress.nextTierThreshold} points).
            </p>
          </div>
        ) : (
          <p style={{ fontSize: '1.1em', color: '#666', marginTop: '25px', fontStyle: 'italic' }}>Congratulations! You are currently in the highest loyalty tier.</p>
        )}

        {/* Points Expiry Notice */}
        {loyaltyData.pointsExpiryNotice && (
          <p style={{ color: '#dc3545', fontWeight: 'bold', marginTop: '30px', padding: '15px', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '8px' }}>
            {loyaltyData.pointsExpiryNotice}
          </p>
        )}
      </section>

      {/* Points History */}
      <section style={{ marginBottom: '30px', padding: '25px', border: '1px solid #e0e0e0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff' }}>
        <h2 style={{ color: '#0056b3', marginTop: '0', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>Points History</h2>
        {loyaltyData.history.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#666' }}>No recent loyalty transactions to display.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
            {loyaltyData.history.map((transaction) => (
              <li key={transaction.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid #eee',
                alignItems: 'center'
              }}>
                <div>
                  <strong style={{ color: transaction.type === 'EARN' ? '#28a745' : '#dc3545', fontSize: '1.1em' }}>
                    {transaction.type === 'EARN' ? '+' : '-'} {transaction.points} points
                  </strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.95em', color: '#555' }}>{transaction.description}</p>
                </div>
                <span style={{ fontSize: '0.85em', color: '#888' }}>
                  {new Date(transaction.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Rewards Catalog */}
      <section style={{ padding: '25px', border: '1px solid #e0e0e0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', backgroundColor: '#fff' }}>
        <h2 style={{ color: '#0056b3', marginTop: '0', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>Available Rewards</h2>
        {loyaltyData.rewards.length === 0 ? (
          <p style={{ fontStyle: 'italic', color: '#666' }}>No rewards available at this time. Check back later!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
            {loyaltyData.rewards.map((reward) => (
              <div key={reward.id} style={{
                border: '1px solid #f0f0f0',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: '#fdfdfd'
              }}>
                {reward.imageUrl && (
                  <img src={reward.imageUrl} alt={reward.name} style={{
                    maxWidth: '100%',
                    height: '160px',
                    objectFit: 'contain',
                    marginBottom: '15px',
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f5',
                    padding: '10px'
                  }} />
                )}
                <h3 style={{ fontSize: '1.2em', color: '#333', marginBottom: '10px' }}>{reward.name}</h3>
                <p style={{ fontSize: '0.95em', color: '#666', flexGrow: 1, marginBottom: '15px' }}>{reward.description}</p>
                <p style={{ fontWeight: 'bold', color: '#007bff', fontSize: '1.1em', marginBottom: '15px' }}>{reward.pointsCost} points</p>
                <button
                  onClick={() => handleRedeemReward(reward.id)}
                  disabled={loyaltyData.balance < reward.pointsCost}
                  style={{
                    backgroundColor: loyaltyData.balance >= reward.pointsCost ? '#007bff' : '#cccccc',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: loyaltyData.balance >= reward.pointsCost ? 'pointer' : 'not-allowed',
                    fontSize: '1em',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  {loyaltyData.balance >= reward.pointsCost
                    ? 'Redeem Now'
                    : `Need ${reward.pointsCost - loyaltyData.balance} more points`
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LoyaltyPage;