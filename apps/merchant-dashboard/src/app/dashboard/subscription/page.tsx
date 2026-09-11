'use client';
import React, { useState } from 'react';

// Mock data and types for demonstration purposes
interface SubscriptionPlan {
  id: string;
  name: 'Starter' | 'Professional' | 'Enterprise' | 'Cancelled';
  price: number; // MRR per month
  features: string[];
}

interface BillingRecord {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  status: 'Paid' | 'Failed' | 'Refunded';
}

const mockPlans: SubscriptionPlan[] = [
  { id: 'starter', name: 'Starter', price: 29, features: ['Basic Analytics', '500 transactions/month'] },
  { id: 'professional', name: 'Professional', price: 99, features: ['Advanced Analytics', '5000 transactions/month', 'API Access'] },
  { id: 'enterprise', name: 'Enterprise', price: 499, features: ['Custom Reporting', 'Unlimited transactions', 'Dedicated Support', 'SLA'] },
];

const mockCurrentPlan: SubscriptionPlan = mockPlans[0]; // Assume user is on Starter plan
const mockNextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // ~30 days from now
const mockMRR = mockCurrentPlan.price;

const mockBillingHistory: BillingRecord[] = [
  { id: 'bill-001', date: '2023-10-15', description: 'Monthly Subscription - Starter', amount: 29.00, status: 'Paid' },
  { id: 'bill-002', date: '2023-09-15', description: 'Monthly Subscription - Starter', amount: 29.00, status: 'Paid' },
  { id: 'bill-003', date: '2023-08-15', description: 'Monthly Subscription - Starter', amount: 29.00, status: 'Paid' },
  { id: 'bill-004', date: '2023-07-15', description: 'Monthly Subscription - Starter', amount: 29.00, status: 'Paid' },
];

// Simple Modal Component (would typically come from a UI library)
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '500px',
        maxWidth: '90%',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2em', cursor: 'pointer' }}>&times;</button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

// Simple Badge Component (would typically come from a UI library)
const Badge: React.FC<{ children: React.ReactNode; type: 'starter' | 'professional' | 'enterprise' | 'default' | 'cancelled' }> = ({ children, type }) => {
  const colorMap = {
    starter: '#3498db', // Blue
    professional: '#27ae60', // Green
    enterprise: '#e74c3c', // Red
    cancelled: '#7f8c8d', // Grey
    default: '#7f8c8d', // Grey
  };
  const bgColor = colorMap[type] || colorMap.default;

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '20px',
      backgroundColor: bgColor,
      color: 'white',
      fontSize: '0.8em',
      fontWeight: 'bold',
      textTransform: 'uppercase',
    }}>
      {children}
    </span>
  );
};


export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(mockCurrentPlan);
  const [nextBillingDate, setNextBillingDate] = useState<string>(mockNextBillingDate);
  const [mrr, setMrr] = useState<number>(mockMRR);
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>(mockBillingHistory);

  const [isUpgradeDowngradeModalOpen, setIsUpgradeDowngradeModalOpen] = useState(false);
  const [isCancelSubscriptionModalOpen, setIsCancelSubscriptionModalOpen] = useState(false);
  const [selectedPlanForChange, setSelectedPlanForChange] = useState<SubscriptionPlan | null>(null);

  const handleOpenUpgradeDowngradeModal = (plan: SubscriptionPlan) => {
    setSelectedPlanForChange(plan);
    setIsUpgradeDowngradeModalOpen(true);
  };
  const handleCloseUpgradeDowngradeModal = () => {
    setIsUpgradeDowngradeModalOpen(false);
    setSelectedPlanForChange(null);
  };

  const handleOpenCancelSubscriptionModal = () => {
    setIsCancelSubscriptionModalOpen(true);
  };
  const handleCloseCancelSubscriptionModal = () => {
    setIsCancelSubscriptionModalOpen(false);
  };

  const calculateProrate = (oldPlan: SubscriptionPlan, newPlan: SubscriptionPlan): string => {
    // Simplified prorate calculation for demonstration.
    // In a real scenario, this would involve precise date calculations
    // based on the actual billing cycle, and potentially API calls.
    if (oldPlan.name === 'Cancelled') {
      return `You will be charged $${newPlan.price.toFixed(2)} immediately for your first month.`;
    }

    const today = new Date();
    const nextBillDate = new Date(nextBillingDate);
    const msPerDay = 1000 * 60 * 60 * 24;

    // Days in current billing cycle (simplified to a standard month for demo)
    const daysInCurrentCycle = 30; // Assuming monthly billing for simplicity
    const daysRemaining = Math.max(0, Math.ceil((nextBillDate.getTime() - today.getTime()) / msPerDay));
    const daysUsed = daysInCurrentCycle - daysRemaining;

    if (daysRemaining <= 0) { // If it's the end of the cycle, no prorate for current month
      return `Your plan will change to ${newPlan.name} starting from your next billing date (${nextBillingDate}). You will be charged $${newPlan.price.toFixed(2)} on that date.`;
    }

    const oldPlanDailyRate = oldPlan.price / daysInCurrentCycle;
    const newPlanDailyRate = newPlan.price / daysInCurrentCycle;

    const refundForUnusedOldPlan = oldPlanDailyRate * daysRemaining;
    const chargeForNewPlan = newPlanDailyRate * daysRemaining;

    const prorateAmount = chargeForNewPlan - refundForUnusedOldPlan;

    if (prorateAmount > 0) {
      return `You will be charged an additional $${prorateAmount.toFixed(2)} today for the prorated period, plus your new monthly rate of $${newPlan.price.toFixed(2)} will apply from your next billing date.`;
    } else if (prorateAmount < 0) {
      return `You will receive a credit of $${Math.abs(prorateAmount).toFixed(2)} for the prorated period, which will be applied to your next bill. Your new monthly rate of $${newPlan.price.toFixed(2)} will apply from your next billing date.`;
    } else {
      return `There will be no prorated charge or credit. Your new monthly rate of $${newPlan.price.toFixed(2)} will apply from your next billing date.`;
    }
  };


  const confirmPlanChange = (plan: SubscriptionPlan) => {
    // In a real application, this would make an API call to update the subscription
    console.log(`Confirming change to ${plan.name} plan.`);
    alert(`Successfully changed to ${plan.name} plan! Details: ${calculateProrate(currentPlan, plan)}`);
    setCurrentPlan(plan);
    setMrr(plan.price);
    if (plan.name === 'Cancelled') {
      setNextBillingDate('N/A (Cancelled)');
    } else if (currentPlan.name === 'Cancelled') { // If reactivating from cancelled, set new billing date
      setNextBillingDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    }
    handleCloseUpgradeDowngradeModal();
  };

  const confirmCancelSubscription = () => {
    // In a real application, this would make an API call to cancel the subscription
    console.log('Confirming subscription cancellation.');
    alert('Your subscription has been cancelled. You will retain access until ' + nextBillingDate);
    // Update UI to reflect cancellation
    setCurrentPlan({ ...currentPlan, name: 'Cancelled', price: 0, features: [] });
    setMrr(0);
    setNextBillingDate('N/A (Cancelled)');
    handleCloseCancelSubscriptionModal();
  };

  const currentPlanBadgeType = currentPlan.name.toLowerCase() as 'starter' | 'professional' | 'enterprise' | 'cancelled';

  return (
    <div style={{ padding: '20px', maxWidth: '960px', margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <h1 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Subscription Management</h1>

      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ marginTop: 0, marginBottom: '15px', color: '#007bff' }}>Current Plan</h2>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <strong style={{ marginRight: '10px' }}>Plan:</strong>
          <Badge type={currentPlanBadgeType}>{currentPlan.name}</Badge>
        </div>
        <p><strong>Next Billing Date:</strong> {nextBillingDate}</p>
        <p><strong>MRR (Monthly Recurring Revenue):</strong> ${mrr.toFixed(2)}</p>

        <div style={{ marginTop: '30px' }}>
          <h3>Change Your Plan</h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px' }}>
            {mockPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleOpenUpgradeDowngradeModal(plan)}
                disabled={currentPlan.id === plan.id}
                style={{
                  padding: '12px 20px',
                  borderRadius: '5px',
                  border: `1px solid ${currentPlan.id === plan.id ? '#007bff' : '#ccc'}`,
                  backgroundColor: currentPlan.id === plan.id ? '#e7f3ff' : 'white',
                  color: currentPlan.id === plan.id ? '#007bff' : '#333',
                  cursor: currentPlan.id === plan.id ? 'not-allowed' : 'pointer',
                  fontWeight: currentPlan.id === plan.id ? 'bold' : 'normal',
                  fontSize: '1em',
                  boxShadow: currentPlan.id === plan.id ? '0 2px 4px rgba(0,123,255,0.2)' : 'none',
                  transition: 'all 0.2s ease-in-out',
                  opacity: currentPlan.id === plan.id ? 0.8 : 1,
                }}
              >
                {plan.name} (${plan.price}/month)
                {currentPlan.id === plan.id && ' (Current)'}
              </button>
            ))}
          </div>
          {currentPlan.name !== 'Cancelled' && (
            <button
              onClick={handleOpenCancelSubscriptionModal}
              style={{
                marginTop: '30px',
                padding: '12px 20px',
                borderRadius: '5px',
                border: '1px solid #dc3545',
                backgroundColor: '#dc3545',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1em',
                fontWeight: 'bold',
                transition: 'background-color 0.2s ease-in-out',
              }}
            >
              Cancel Subscription
            </button>
          )}
          {currentPlan.name === 'Cancelled' && (
            <p style={{ marginTop: '20px', color: '#dc3545', fontWeight: 'bold' }}>
              Your subscription is currently cancelled. You can reactivate by selecting a plan above.
            </p>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ marginBottom: '15px', color: '#007bff' }}>Billing History</h2>
        {billingHistory.length === 0 ? (
          <p>No billing history available.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ backgroundColor: '#e9ecef', borderBottom: '1px solid #dee2e6' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((record) => (
                <tr key={record.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                  <td style={{ padding: '12px' }}>{record.date}</td>
                  <td style={{ padding: '12px' }}>{record.description}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>${record.amount.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Upgrade/Downgrade Plan Modal */}
      <Modal
        isOpen={isUpgradeDowngradeModalOpen}
        onClose={handleCloseUpgradeDowngradeModal}
        title={`Confirm Plan Change to ${selectedPlanForChange?.name}`}
      >
        {selectedPlanForChange && (
          <div>
            <p>You are about to change your subscription from <strong>{currentPlan.name}</strong> to <strong>{selectedPlanForChange.name}</strong>.</p>
            <p>The new monthly price will be <strong>${selectedPlanForChange.price.toFixed(2)}</strong>.</p>
            <p style={{ fontWeight: 'bold', marginTop: '15px' }}>Prorate Calculation:</p>
            <p>{calculateProrate(currentPlan, selectedPlanForChange)}</p>
            <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Do you want to proceed?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
              <button
                onClick={handleCloseUpgradeDowngradeModal}
                style={{ padding: '10px 18px', borderRadius: '5px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmPlanChange(selectedPlanForChange)}
                style={{ padding: '10px 18px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' }}
              >
                Confirm Change
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Subscription Modal */}
      <Modal
        isOpen={isCancelSubscriptionModalOpen}
        onClose={handleCloseCancelSubscriptionModal}
        title="Confirm Subscription Cancellation"
      >
        <div>
          <p>Are you sure you want to cancel your <strong>{currentPlan.name}</strong> subscription?</p>
          <p>You will lose access to premium features after your current billing period ends on <strong>{nextBillingDate}</strong>.</p>
          <p style={{ marginTop: '15px', fontWeight: 'bold', color: '#dc3545' }}>This action cannot be undone immediately, though you can reactivate your subscription at any time.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
            <button
              onClick={handleCloseCancelSubscriptionModal}
              style={{ padding: '10px 18px', borderRadius: '5px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}
            >
              Keep Subscription
            </button>
            <button
              onClick={confirmCancelSubscription}
              style={{ padding: '10px 18px', borderRadius: '5px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer' }}
            >
              Yes, Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}