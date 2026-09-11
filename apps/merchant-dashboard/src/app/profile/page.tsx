'use client';

import React, { useState, useEffect, FormEvent } from 'react';

// --- Interfaces for Data ---
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

interface NotificationSettings {
  [eventType: string]: {
    email: boolean;
    sms: boolean;
  };
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

// --- Client Components ---

// Profile Details Form (Name, Email, Phone, Address)
const ProfileDetailsForm: React.FC<{ initialProfile: UserProfile }> = ({ initialProfile }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Profile Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2">Address</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">Street</label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={profile.address.street}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={profile.address.city}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">State / Province</label>
              <input
                type="text"
                id="address.state"
                name="address.state"
                value={profile.address.state}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="address.zip" className="block text-sm font-medium text-gray-700">ZIP / Postal Code</label>
              <input
                type="text"
                id="address.zip"
                name="address.zip"
                value={profile.address.zip}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                value={profile.address.country}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

// Change Password Form
const ChangePasswordForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirmation do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

// Notification Preferences
const NotificationPreferences: React.FC<{ initialSettings: NotificationSettings }> = ({ initialSettings }) => {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const eventTypes = [
    { key: 'transaction_success', label: 'Transaction Success' },
    { key: 'transaction_failed', label: 'Transaction Failed' },
    { key: 'promotion', label: 'Promotions & Offers' },
    { key: 'security_alert', label: 'Security Alerts' },
    { key: 'monthly_summary', label: 'Monthly Summary' },
  ];

  const handleToggle = (eventType: string, channel: 'email' | 'sms') => {
    setSettings(prev => ({
      ...prev,
      [eventType]: {
        ...prev[eventType],
        [channel]: !prev[eventType]?.[channel],
      },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update notification settings');
      }

      setSuccess('Notification settings updated successfully!');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Notification Preferences</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {eventTypes.map((event) => (
          <div key={event.key} className="flex items-center justify-between border-b pb-2 last:border-b-0">
            <span className="text-gray-700">{event.label}</span>
            <div className="flex items-center space-x-4">
              <label htmlFor={`${event.key}-email`} className="flex items-center cursor-pointer">
                <span className="mr-2 text-sm text-gray-600">Email</span>
                <input
                  type="checkbox"
                  id={`${event.key}-email`}
                  checked={settings[event.key]?.email || false}
                  onChange={() => handleToggle(event.key, 'email')}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <label htmlFor={`${event.key}-sms`} className="flex items-center cursor-pointer">
                <span className="mr-2 text-sm text-gray-600">SMS</span>
                <input
                  type="checkbox"
                  id={`${event.key}-sms`}
                  checked={settings[event.key]?.sms || false}
                  onChange={() => handleToggle(event.key, 'sms')}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        ))}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
};

// Payment Methods List
const PaymentMethodsList: React.FC<{ initialPaymentMethods: PaymentMethod[] }> = ({ initialPaymentMethods }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods);
  // In a real app, adding/removing payment methods would involve more state and API calls.
  // For this task, we're focusing on displaying, so no loading/error states for actions here.

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Methods</h2>
      {paymentMethods.length === 0 ? (
        <p className="text-gray-600">No payment methods added yet.</p>
      ) : (
        <ul className="space-y-3">
          {paymentMethods.map((method) => (
            <li key={method.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
              <div className="flex items-center">
                <span className="mr-3 text-2xl">💳</span> {/* Generic card icon */}
                <div>
                  <p className="font-medium text-gray-800">{method.brand} ending in {method.last4}</p>
                  <p className="text-sm text-gray-600">Expires {method.expMonth}/{method.expYear}</p>
                </div>
              </div>
              {method.isDefault && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Default</span>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 text-sm text-blue-600 hover:underline">
        <a href="/wallet">Add/Manage Payment Methods</a>
      </div>
    </div>
  );
};

// Wallet Quick-Access Link
const WalletQuickAccess: React.FC = () => {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white text-center">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Wallet</h2>
      <p className="text-gray-600 mb-4">Access your stored payment methods and manage funds.</p>
      <a
        href="/wallet"
        className="inline-block py-2 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Go to Wallet
      </a>
    </div>
  );
};

// Main Page Component
const ProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, notifRes, paymentsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/notification-settings'),
          fetch('/api/payment-methods'),
        ]);

        if (!profileRes.ok) throw new Error('Failed to fetch profile.');
        if (!notifRes.ok) throw new Error('Failed to fetch notification settings.');
        if (!paymentsRes.ok) throw new Error('Failed to fetch payment methods.');

        const profileData: UserProfile = await profileRes.json();
        const notifData: NotificationSettings = await notifRes.json();
        const paymentsData: PaymentMethod[] = await paymentsRes.json();

        setUserProfile(profileData);
        setNotificationSettings(notifData);
        setPaymentMethods(paymentsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load page data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-6">
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-60 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-red-700 text-center">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p>{error}</p>
        <p className="mt-4">Please try reloading the page.</p>
      </div>
    );
  }

  // Provide default empty objects for initial settings if data is null (shouldn't happen with error handling, but good for type safety)
  const defaultProfile: UserProfile = { name: '', email: '', phone: '', address: { street: '', city: '', state: '', zip: '', country: '' } };
  const defaultNotificationSettings: NotificationSettings = {
    transaction_success: { email: true, sms: false },
    transaction_failed: { email: true, sms: true },
    promotion: { email: true, sms: false },
    security_alert: { email: true, sms: true },
    monthly_summary: { email: true, sms: false },
  };
  const defaultPaymentMethods: PaymentMethod[] = [];


  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Profile</h1>

      <ProfileDetailsForm initialProfile={userProfile || defaultProfile} />
      <ChangePasswordForm />
      <NotificationPreferences initialSettings={notificationSettings || defaultNotificationSettings} />
      <PaymentMethodsList initialPaymentMethods={paymentMethods || defaultPaymentMethods} />
      <WalletQuickAccess />
    </div>
  );
};

export default ProfilePage;