'use client';

import React, { useState, useEffect, FormEvent } from 'react';

// Define types for wallet data
interface WalletData {
  balance: string;
  currency: string;
  limits: {
    dailySpending: string;
    monthlySpending: string;
    dailyTopUp: string;
  };
}

interface Transaction {
  id: string;
  type: 'TOPUP' | 'P2P_TRANSFER_OUT' | 'P2P_TRANSFER_IN' | 'PURCHASE' | 'REFUND';
  amount: string;
  currency: string;
  timestamp: string;
  description: string;
}

export default function WalletPage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for Top-up
  const [topUpCardNumber, setTopUpCardNumber] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpMessage, setTopUpMessage] = useState<string | null>(null);

  // Form states for P2P Transfer
  const [transferRecipient, setTransferRecipient] = useState(''); // email or phone
  const [transferAmount, setTransferAmount] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferMessage, setTransferMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [walletRes, transactionsRes] = await Promise.all([
        fetch('/api/wallets/me'),
        fetch('/api/wallets/me/transactions'),
      ]);

      if (!walletRes.ok) {
        throw new Error(`Failed to fetch wallet data: ${walletRes.statusText}`);
      }
      if (!transactionsRes.ok) {
        throw new Error(`Failed to fetch transactions: ${transactionsRes.statusText}`);
      }

      const walletJson: WalletData = await walletRes.json();
      const transactionsJson: Transaction[] = await transactionsRes.json();

      setWalletData(walletJson);
      setTransactions(transactionsJson);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while fetching data.');
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTopUp = async (e: FormEvent) => {
    e.preventDefault();
    setTopUpLoading(true);
    setTopUpMessage(null);

    // Basic client-side validation
    const amountValue = parseFloat(topUpAmount);
    if (!topUpCardNumber.trim() || isNaN(amountValue) || amountValue <= 0) {
      setTopUpMessage('Please enter a valid card number and a positive amount.');
      setTopUpLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/wallets/me/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardNumber: topUpCardNumber, amount: amountValue }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Top-up failed.');
      }

      setTopUpMessage('Top-up successful!');
      setTopUpCardNumber('');
      setTopUpAmount('');
      await fetchData(); // Refresh wallet balance and transactions
    } catch (err: any) {
      setTopUpMessage(err.message || 'An unknown error occurred during top-up.');
      console.error('Error during top-up:', err);
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleP2PTransfer = async (e: FormEvent) => {
    e.preventDefault();
    setTransferLoading(true);
    setTransferMessage(null);

    // Basic client-side validation
    const amountValue = parseFloat(transferAmount);
    if (!transferRecipient.trim() || isNaN(amountValue) || amountValue <= 0) {
      setTransferMessage('Please enter a valid recipient and a positive amount.');
      setTransferLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/wallets/me/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientIdentifier: transferRecipient, // Could be email or phone
          amount: amountValue,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'P2P transfer failed.');
      }

      setTransferMessage('P2P transfer successful!');
      setTransferRecipient('');
      setTransferAmount('');
      await fetchData(); // Refresh wallet balance and transactions
    } catch (err: any) {
      setTransferMessage(err.message || 'An unknown error occurred during transfer.');
      console.error('Error during P2P transfer:', err);
    } finally {
      setTransferLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
        <h2>Loading Wallet...</h2>
        <p>Fetching your wallet data and transaction history.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto', fontFamily: 'Arial, sans-serif', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchData} style={{ padding: '10px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', marginTop: '15px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>
      <h1 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>My Digital Wallet</h1>

      {walletData && (
        <section style={{ marginBottom: '30px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#007bff', marginBottom: '15px' }}>Current Balance</h2>
          <p style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#28a745', marginBottom: '10px' }}>
            {walletData.balance} {walletData.currency}
          </p>

          <h3 style={{ color: '#555', marginTop: '20px', marginBottom: '10px' }}>Spending Limits</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li style={{ marginBottom: '5px' }}>Daily Spending: <span style={{ fontWeight: 'bold' }}>{walletData.limits.dailySpending} {walletData.currency}</span></li>
            <li style={{ marginBottom: '5px' }}>Monthly Spending: <span style={{ fontWeight: 'bold' }}>{walletData.limits.monthlySpending} {walletData.currency}</span></li>
            <li style={{ marginBottom: '5px' }}>Daily Top-Up: <span style={{ fontWeight: 'bold' }}>{walletData.limits.dailyTopUp} {walletData.currency}</span></li>
          </ul>
        </section>
      )}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
        {/* Top-up Form */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#007bff', marginBottom: '15px' }}>Top-up Wallet</h2>
          <form onSubmit={handleTopUp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label htmlFor="cardNumber" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Card Number</label>
              <input
                id="cardNumber"
                type="text" // In a real app, this would be a secure, masked input
                value={topUpCardNumber}
                onChange={(e) => setTopUpCardNumber(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="topUpAmount" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Amount</label>
              <input
                id="topUpAmount"
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              disabled={topUpLoading}
              style={{
                padding: '10px 15px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: topUpLoading ? '#cccccc' : '#28a745',
                color: 'white',
                cursor: topUpLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
              }}
            >
              {topUpLoading ? 'Processing...' : 'Top Up'}
            </button>
            {topUpMessage && (
              <p style={{
                color: topUpMessage.includes('successful') ? 'green' : 'red',
                marginTop: '10px',
                textAlign: 'center'
              }}>
                {topUpMessage}
              </p>
            )}
          </form>
        </div>

        {/* P2P Transfer Form */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#007bff', marginBottom: '15px' }}>P2P Transfer</h2>
          <form onSubmit={handleP2PTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label htmlFor="recipient" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Recipient (Email/Phone)</label>
              <input
                id="recipient"
                type="text"
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
                placeholder="recipient@example.com or +15551234567"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="transferAmount" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Amount</label>
              <input
                id="transferAmount"
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              disabled={transferLoading}
              style={{
                padding: '10px 15px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: transferLoading ? '#cccccc' : '#007bff',
                color: 'white',
                cursor: transferLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
              }}
            >
              {transferLoading ? 'Sending...' : 'Send Transfer'}
            </button>
            {transferMessage && (
              <p style={{
                color: transferMessage.includes('successful') ? 'green' : 'red',
                marginTop: '10px',
                textAlign: 'center'
              }}>
                {transferMessage}
              </p>
            )}
          </form>
        </div>
      </section>

      <section style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#007bff', marginBottom: '20px' }}>Transaction History</h2>
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#e9ecef' }}>
                <tr>
                  <th style={{ padding: '12px 15px', borderBottom: '1px solid #dee2e6' }}>Date</th>
                  <th style={{ padding: '12px 15px', borderBottom: '1px solid #dee2e6' }}>Type</th>
                  <th style={{ padding: '12px 15px', borderBottom: '1px solid #dee2e6' }}>Description</th>
                  <th style={{ padding: '12px 15px', borderBottom: '1px solid #dee2e6' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 15px' }}>{new Date(tx.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '12px 15px' }}>{tx.type.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '12px 15px' }}>{tx.description}</td>
                    <td style={{ padding: '12px 15px', color: tx.type.includes('OUT') || tx.type === 'PURCHASE' ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                      {tx.type.includes('OUT') || tx.type === 'PURCHASE' ? '-' : '+'}
                      {tx.amount} {tx.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}