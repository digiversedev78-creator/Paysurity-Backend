'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RoleEnum } from '@paysurity/types';

// Define the base URL for API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// DB-Driven API Client
const fetchTenantConfig = async (tenantId: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/tenants/${tenantId}/config`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Database Connection Expected');
  return res.json();
};

const mutateTenantConfig = async (tenantId: string, payload: Partial<TenantConfig>) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/tenants/${tenantId}/config`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Database Connection Expected');
  return res.json();
};

// --- INTERFACES ---

interface LoyaltyTier {
  id?: string; // Optional for new tiers, will be generated on backend
  name: string;
  threshold: number; // Points threshold
  multiplier: number; // E.g., 1.2 for 20% bonus
}

interface TeamMember {
  id: string; // User ID
  name: string;
  email: string;
  role: RoleEnum;
}

interface NotificationPreferences {
  emailPromotions: boolean;
  emailSystemAlerts: boolean;
  smsPromotions: boolean;
  smsSystemAlerts: boolean;
}

interface TenantConfig {
  businessName: string;
  address: string;
  phone: string;
  logoUrl?: string; // Optional logo URL

  preferredProcessor: string;

  loyaltyEnabled: boolean;
  pointsPerDollar: number;
  loyaltyTiers: LoyaltyTier[];

  notificationPreferences: NotificationPreferences;
  webhookUrl: string;

  teamMembers: TeamMember[]; // Assuming team members are part of tenant config for simplicity as per rule
}

// The existing MerchantProfile and NotificationPreferences are not directly used as
// the task implies a consolidated config for tenant settings.
// For consistency with existing code, we'll keep the MerchantProfile interface but comment out its usage.
/*
interface MerchantProfile {
  id: string;
  businessName: string;
  tenantId: string;
  plan: string;
  gatewayProvider: string;
  gatewayStatus: 'active' | 'inactive' | 'pending';
  mcc: string;
  mccDescription: string;
  location: string;
  processingRate?: string;
  settlementFrequency?: string;
  bankAccountLast4?: string;
  bankAccountProvider?: string;
  acceptedMethods?: string[];
  tipPoolingEnabled?: boolean;
  tipPoolingDetails?: string;
}
*/

const getTenantIdFromToken = (): string | null => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('paysurity_auth_token') || localStorage.getItem('token') : null;
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.tenantId || null;
  } catch (e) {
    return null;
  }
};

export default function SettingsPage() {
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const id = getTenantIdFromToken();
    if (!id) {
      // Redirect to login if no valid token — don't operate without a real tenant
      window.location.href = '/login';
      return;
    }
    setTenantId(id);
  }, []);

  // State for active tab and overall page status
  const [activeTab, setActiveTab] = useState<'business' | 'payments' | 'loyalty' | 'notifications' | 'team'>('business');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- Tab 1: Business State ---
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [logoFile, setLogoFile] = useState<File | null>(null); // For new logo upload

  // --- Tab 2: Payments State ---
  const [preferredProcessor, setPreferredProcessor] = useState('');
  const [availableProcessors, setAvailableProcessors] = useState<string[]>([]);
  const [testPaymentResult, setTestPaymentResult] = useState<string | null>(null);
  const [testPaymentLoading, setTestPaymentLoading] = useState(false);

  // --- Tab 3: Loyalty State ---
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
  const [pointsPerDollar, setPointsPerDollar] = useState(0.01);
  const [loyaltyTiers, setLoyaltyTiers] = useState<LoyaltyTier[]>([]);

  // --- Tab 4: Notifications State ---
  const [emailPromotions, setEmailPromotions] = useState(false);
  const [emailSystemAlerts, setEmailSystemAlerts] = useState(false);
  const [smsPromotions, setSmsPromotions] = useState(false);
  const [smsSystemAlerts, setSmsSystemAlerts] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  // --- Tab 5: Team State ---
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newTeamMemberEmail, setNewTeamMemberEmail] = useState('');
  const [newTeamMemberRole, setNewTeamMemberRole] = useState<RoleEnum>(RoleEnum.GUEST);

  // --- Fetch initial configuration on component mount ---
  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const config = await fetchTenantConfig(tenantId);
        
        // Business
        setBusinessName(config.businessName);
        setAddress(config.address);
        setPhone(config.phone);
        setLogoUrl(config.logoUrl);

        // Payments
        setPreferredProcessor(config.preferredProcessor);
        setAvailableProcessors(['FluidPay', 'Stripe', 'Braintree']);

        // Loyalty
        setLoyaltyEnabled(config.loyaltyEnabled);
        setPointsPerDollar(config.pointsPerDollar);
        setLoyaltyTiers(config.loyaltyTiers);

        // Notifications
        setEmailPromotions(config.notificationPreferences?.emailPromotions || false);
        setEmailSystemAlerts(config.notificationPreferences?.emailSystemAlerts || false);
        setSmsPromotions(config.notificationPreferences?.smsPromotions || false);
        setSmsSystemAlerts(config.notificationPreferences?.smsSystemAlerts || false);
        setWebhookUrl(config.webhookUrl);

        // Team
        setTeamMembers(config.teamMembers || []);
      } catch (err: unknown) {
        console.error("Failed to fetch tenant config:", err);
        // DB-Driven Fallback explicit error
        setError(`Database Connection Refused. Cannot load Tenant Settings.`);
        
        // Graceful DB-Offline Fallback strictly using Merchant data, NOT PaySurity data.
        setBusinessName('House of Biryani');
        setAddress('123 Culinary Lane, Chicago IL');
        setPhone('+1 (555) 999-8888');
        setTeamMembers([
           { id: 'u1', name: 'Chef Gordon', email: 'gordon@houseofbiryani.com', role: RoleEnum.ADMIN }
        ]);
        setAvailableProcessors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [tenantId]);

  // --- Generic Save Handler for all settings ---
  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      let currentLogoUrl = logoUrl;
      // If a new logo file is selected, upload it first
      if (logoFile) {
        console.log("Uploading logo file...");
        // DB-Driven API fetch for upload
        const formData = new FormData();
        formData.append('file', logoFile);
        const res = await fetch(`${API_BASE_URL}/cloud-storage/upload`, {
           method: 'POST',
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
           body: formData
        });
        if (!res.ok) throw new Error('Storage Drive Connection Expected');
        const uploadResponse = await res.json();
        currentLogoUrl = uploadResponse.url; 
        setLogoUrl(currentLogoUrl); 
      }

      const payload: Partial<TenantConfig> = {
        // Business
        businessName,
        address,
        phone,
        logoUrl: currentLogoUrl,
        // Payments
        preferredProcessor,
        // Loyalty
        loyaltyEnabled,
        pointsPerDollar,
        loyaltyTiers,
        // Notifications
        notificationPreferences: {
          emailPromotions,
          emailSystemAlerts,
          smsPromotions,
          smsSystemAlerts,
        },
        webhookUrl,
        // Team (as per requirement: "All settings PATCH to /tenants/:id/config")
        // In a real system, team member management often has separate, dedicated endpoints.
        teamMembers,
      };

      await mutateTenantConfig(tenantId, payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Clear success message after 3 seconds
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Failed to save tenant config:", error);
      setError(`Database Sync Failed: ${error.message}. Connection string expected.`);
    } finally {
      setSaving(false);
    }
  }, [
    tenantId, businessName, address, phone, logoUrl, logoFile,
    preferredProcessor,
    loyaltyEnabled, pointsPerDollar, loyaltyTiers,
    emailPromotions, emailSystemAlerts, smsPromotions, smsSystemAlerts, webhookUrl,
    teamMembers // Include teamMembers in dependency array as they are part of the payload
  ]);

  // --- Handlers for Loyalty Tiers ---
  const handleAddTier = () => {
    // Add a new empty tier, ID will be assigned by backend
    setLoyaltyTiers([...loyaltyTiers, { name: '', threshold: 0, multiplier: 1 }]);
  };

  const handleUpdateTier = (index: number, field: keyof LoyaltyTier, value: string | number) => {
    const updatedTiers = [...loyaltyTiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setLoyaltyTiers(updatedTiers);
  };

  const handleRemoveTier = (index: number) => {
    setLoyaltyTiers(loyaltyTiers.filter((_, i) => i !== index));
  };

  // --- Handlers for Team Members ---
  const handleAddTeamMember = () => {
    if (!newTeamMemberEmail) {
      alert("Please enter an email address for the new team member.");
      return;
    }

    // In a real application, this would typically involve an API call to invite
    // or create a user, which would then return a user ID. For this task,
    // we generate a mock ID and update the local state.
    // The actual persistence will happen on the general "Save All Settings".
    const newMember: TeamMember = {
        id: `user_${Date.now()}`, // Mock ID
        name: newTeamMemberEmail.split('@')[0], // Basic name derivation
        email: newTeamMemberEmail,
        role: newTeamMemberRole,
    };
    setTeamMembers([...teamMembers, newMember]);
    setNewTeamMemberEmail(''); // Clear input
    setNewTeamMemberRole(RoleEnum.GUEST); // Reset role selector
  };

  const handleRemoveTeamMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== memberId));
  };

  const handleUpdateTeamMemberRole = (memberId: string, newRole: TeamMember['role']) => {
    setTeamMembers(teamMembers.map(member =>
      member.id === memberId ? { ...member, role: newRole } : member
    ));
  };

  // --- Test Payment Handler ---
  const handleTestPayment = async () => {
    setTestPaymentLoading(true);
    setTestPaymentResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/payments/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1.00,
          currency: 'USD',
          processor: preferredProcessor,
          tenantId: tenantId,
        })
      });
      if (!res.ok) throw new Error('Payment Gateway Integration Offline in Staging');
      const response = await res.json();
      setTestPaymentResult(`Success: ${response.message} (Transaction ID: ${response.transactionId})`);
    } catch (err: unknown) {
      const error = err as Error;
      setTestPaymentResult(`Error: ${error.message || 'Failed to process test payment.'}`);
    } finally {
      setTestPaymentLoading(false);
    }
  };

  // --- Loading and Error States ---
  if (loading) {
    if (!tenantId) { return <div style={{ padding: '2rem', color: '#94a3b8' }}>Verifying session…</div>; }
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h2>Loading Settings...</h2>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Tenant Settings</h1>
      
      {/* Non-intrusive Error Banner */}
      {error && !saveSuccess && !saving && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px 15px', borderRadius: '5px', border: '1px solid #f5c6cb', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>Offline Mode:</strong> {error}</span>
          <button onClick={() => window.location.reload()} style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em' }}>Retry Connection</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
        {['business', 'payments', 'loyalty', 'notifications', 'team'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: '10px 15px',
              marginRight: '5px',
              border: 'none',
              backgroundColor: activeTab === tab ? '#007bff' : '#f0f0f0',
              color: activeTab === tab ? 'white' : 'black',
              cursor: 'pointer',
              borderRadius: '5px 5px 0 0',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              outline: 'none',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '5px', position: 'relative' }}>
        {/* Loading Overlay for Save Action */}
        {saving && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: '5px'
          }}>
            <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Saving changes...</p>
          </div>
        )}

        {/* Save Success Message */}
        {saveSuccess && (
          <div style={{
            backgroundColor: '#d4edda', color: '#155724', padding: '10px',
            marginBottom: '15px', borderRadius: '5px', border: '1px solid #c3e6cb'
          }}>
            Settings saved successfully!
          </div>
        )}
        {/* Error Message (for save operations) */}
        {error && saveSuccess === false && saving && (
          <div style={{
            backgroundColor: '#f8d7da', color: '#721c24', padding: '10px',
            marginBottom: '15px', borderRadius: '5px', border: '1px solid #f5c6cb'
          }}>
            Error: {error}
          </div>
        )}

        {/* Tab 1: Business */}
        {activeTab === 'business' && (
          <div>
            <h2>Business Information</h2>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="businessName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Business Name:</label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="address" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Address:</label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="phone" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone:</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Logo Upload:</label>
              {logoUrl && (
                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <img src={logoUrl} alt="Business Logo" style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #eee', objectFit: 'contain' }} />
                  <p style={{ fontSize: '0.9em', color: '#666' }}>Current Logo (uploading a new file will replace this)</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', display: 'block', width: 'auto' }}
              />
              {logoFile && <p style={{ fontSize: '0.9em', color: '#333', marginTop: '5px' }}>Selected for upload: <strong>{logoFile.name}</strong></p>}
            </div>
          </div>
        )}

        {/* Tab 2: Payments */}
        {activeTab === 'payments' && (
          <div>
            <h2>Payment Settings</h2>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="preferredProcessor" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Preferred Processor:</label>
              <select
                id="preferredProcessor"
                value={preferredProcessor}
                onChange={(e) => setPreferredProcessor(e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              >
                {availableProcessors.length === 0 && <option value="">Loading processors...</option>}
                {availableProcessors.map(processor => (
                    <option key={processor} value={processor}>{processor}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <button
                type="button"
                onClick={handleTestPayment}
                disabled={testPaymentLoading}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: testPaymentLoading ? 'not-allowed' : 'pointer',
                  opacity: testPaymentLoading ? 0.7 : 1,
                  fontSize: '1em'
                }}
              >
                {testPaymentLoading ? 'Testing...' : 'Test Payment Integration'}
              </button>
              {testPaymentResult && (
                <p style={{ marginTop: '10px', color: testPaymentResult.startsWith('Error') ? 'red' : 'green', fontSize: '0.9em' }}>
                  {testPaymentResult}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Loyalty */}
        {activeTab === 'loyalty' && (
          <div>
            <h2>Loyalty Program Settings</h2>
            <div style={{ marginBottom: '15px' }}>
              <input
                id="loyaltyEnabled"
                type="checkbox"
                checked={loyaltyEnabled}
                onChange={(e) => setLoyaltyEnabled(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              <label htmlFor="loyaltyEnabled" style={{ fontWeight: 'bold' }}>Enable Loyalty Program</label>
            </div>
            {loyaltyEnabled && (
              <>
                <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #f0f0f0', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                  <label htmlFor="pointsPerDollar" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Points per Dollar Spent:</label>
                  <input
                    id="pointsPerDollar"
                    type="number"
                    step="0.01"
                    min="0"
                    value={pointsPerDollar}
                    onChange={(e) => setPointsPerDollar(parseFloat(e.target.value))}
                    style={{ width: 'calc(100% - 12px)', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                  />
                  <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>e.g., 0.05 means customers earn 5 points for every dollar spent.</p>
                </div>

                <h3>Loyalty Tiers</h3>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>Define different loyalty tiers based on points thresholds, each with a potential multiplier for bonus points.</p>
                {loyaltyTiers.length === 0 && <p>No loyalty tiers defined yet. Add your first tier!</p>}
                {loyaltyTiers.map((tier, index) => (
                  <div key={tier.id || index} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '4px', backgroundColor: '#fff' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tier Name:</label>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => handleUpdateTier(index, 'name', e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Points Threshold:</label>
                      <input
                        type="number"
                        min="0"
                        value={tier.threshold}
                        onChange={(e) => handleUpdateTier(index, 'threshold', parseInt(e.target.value, 10))}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                      <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>Points required to reach this tier. (0 for base tier)</p>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Points Multiplier:</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        value={tier.multiplier}
                        onChange={(e) => handleUpdateTier(index, 'multiplier', parseFloat(e.target.value))}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                       <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>e.g., 1.2 for 20% bonus points (1 means no bonus).</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(index)}
                      style={{
                        marginTop: '10px', padding: '8px 12px', backgroundColor: '#dc3545',
                        color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em'
                      }}
                    >
                      Remove Tier
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddTier}
                  style={{
                    padding: '10px 15px', backgroundColor: '#007bff', color: 'white',
                    border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontSize: '1em'
                  }}
                >
                  Add New Tier
                </button>
              </>
            )}
          </div>
        )}

        {/* Tab 4: Notifications */}
        {activeTab === 'notifications' && (
          <div>
            <h2>Notification Settings</h2>
            <div style={{ marginBottom: '15px' }}>
              <input
                id="emailPromotions"
                type="checkbox"
                checked={emailPromotions}
                onChange={(e) => setEmailPromotions(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              <label htmlFor="emailPromotions" style={{ fontWeight: 'bold' }}>Receive Email Promotions</label>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <input
                id="emailSystemAlerts"
                type="checkbox"
                checked={emailSystemAlerts}
                onChange={(e) => setEmailSystemAlerts(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              <label htmlFor="emailSystemAlerts" style={{ fontWeight: 'bold' }}>Receive System Alert Emails</label>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <input
                id="smsPromotions"
                type="checkbox"
                checked={smsPromotions}
                onChange={(e) => setSmsPromotions(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              <label htmlFor="smsPromotions" style={{ fontWeight: 'bold' }}>Receive SMS Promotions</label>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <input
                id="smsSystemAlerts"
                type="checkbox"
                checked={smsSystemAlerts}
                onChange={(e) => setSmsSystemAlerts(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              <label htmlFor="smsSystemAlerts" style={{ fontWeight: 'bold' }}>Receive System Alert SMS</label>
            </div>
            <div style={{ marginBottom: '15px', marginTop: '30px' }}>
              <label htmlFor="webhookUrl" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Webhook URL for Integrations:</label>
              <input
                id="webhookUrl"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-integration.com/webhook"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              />
              <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                This URL will receive real-time notifications for specified events (e.g., new payment, refund).
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Team */}
        {activeTab === 'team' && (
          <div>
            <h2>Team Management</h2>
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '20px' }}>
                Add, remove, and assign roles to staff members accessing your PaySurity account.
            </p>

            <h3>Current Team Members</h3>
            {teamMembers.length === 0 ? (
                <p>No team members added yet.</p>
            ) : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {teamMembers.map((member) => (
                        <li key={member.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
                            padding: '10px', border: '1px solid #eee', marginBottom: '8px', borderRadius: '4px', backgroundColor: '#fdfdfd'
                        }}>
                            <div style={{ flexGrow: 1, minWidth: '150px', marginBottom: '5px' }}>
                                <strong>{member.name}</strong> <br /> <span style={{ fontSize: '0.9em', color: '#555' }}>({member.email})</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}>
                                <select
                                    value={member.role}
                                    onChange={(e) => handleUpdateTeamMemberRole(member.id, e.target.value as RoleEnum)}
                                    style={{ padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9em' }}
                                >
                                    <option value={RoleEnum.ADMIN}>Admin</option>
                                    <option value={RoleEnum.USER}>Editor</option>
                                    <option value={RoleEnum.GUEST}>Viewer</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTeamMember(member.id)}
                                    style={{
                                        padding: '6px 10px', backgroundColor: '#dc3545', color: 'white',
                                        border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em'
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <h3 style={{ marginTop: '30px' }}>Add New Team Member</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <input
                    type="email"
                    placeholder="Enter email address"
                    value={newTeamMemberEmail}
                    onChange={(e) => setNewTeamMemberEmail(e.target.value)}
                    style={{ flexGrow: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', minWidth: '200px' }}
                />
                <select
                    value={newTeamMemberRole}
                    onChange={(e) => setNewTeamMemberRole(e.target.value as RoleEnum)}
                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minWidth: '100px' }}
                >
                    <option value={RoleEnum.GUEST}>Viewer</option>
                    <option value={RoleEnum.USER}>Editor</option>
                    <option value={RoleEnum.ADMIN}>Admin</option>
                </select>
                <button
                    type="button"
                    onClick={handleAddTeamMember}
                    style={{
                        padding: '8px 15px', backgroundColor: '#007bff', color: 'white',
                        border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em'
                    }}
                >
                    Add Member
                </button>
            </div>
            <p style={{ fontSize: '0.8em', color: '#666' }}>
                New members will be added to the list above and changes will be saved when you click "Save All Settings".
            </p>
          </div>
        )}

        {/* Universal Save Button */}
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'right' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 25px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              transition: 'background-color 0.2s, opacity 0.2s',
            }}
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}