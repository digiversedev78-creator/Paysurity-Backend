'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Define interfaces for data
interface Payment {
  id: string;
  tenantName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'disputed' | 'chargeback';
  transactionDate: string;
  customerEmail: string;
  merchantOrderId?: string;
  processorTransactionId?: string;
  feeAmount?: number;
}

interface Metrics {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
}

interface PaymentsApiResponse {
  payments: Payment[];
  totalCount: number;
  metrics: Metrics;
}

// Helper to format currency
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [minAmountFilter, setMinAmountFilter] = useState<string>('');
  const [maxAmountFilter, setMaxAmountFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>(''); // For general search like order ID, customer email

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPayments, setTotalPayments] = useState<number>(0);

  // Tab for different views (e.g., All, Disputes, Chargebacks)
  const [activeTab, setActiveTab] = useState<'all' | 'disputes' | 'chargebacks'>('all');

  const paymentStatuses = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'disputed', label: 'Disputed' },
    { value: 'chargeback', label: 'Chargeback' },
  ];

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const queryParams = new URLSearchParams();

    // Apply status filter based on active tab, override if tab is not 'all'
    if (activeTab === 'disputes') {
      queryParams.append('status', 'disputed');
    } else if (activeTab === 'chargebacks') {
      queryParams.append('status', 'chargeback');
    } else if (statusFilter !== 'all') { // Only apply statusFilter if not overridden by activeTab
      queryParams.append('status', statusFilter);
    }

    if (startDateFilter) queryParams.append('startDate', startDateFilter);
    if (endDateFilter) queryParams.append('endDate', endDateFilter);
    if (minAmountFilter) queryParams.append('minAmount', minAmountFilter);
    if (maxAmountFilter) queryParams.append('maxAmount', maxAmountFilter);
    if (searchTerm) queryParams.append('search', searchTerm);

    queryParams.append('page', currentPage.toString());
    queryParams.append('pageSize', pageSize.toString());

    try {
      const response = await fetch(`/api/admin/payments?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch payments');
      }

      const data: PaymentsApiResponse = await response.json();
      setPayments(data.payments);
      setMetrics(data.metrics);
      setTotalPayments(data.totalCount);

    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'An unexpected error occurred.');
      setPayments([]); // Clear payments on error
      setMetrics(null); // Clear metrics on error
      setTotalPayments(0); // Reset total count on error
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    statusFilter,
    startDateFilter,
    endDateFilter,
    minAmountFilter,
    maxAmountFilter,
    searchTerm,
    currentPage,
    pageSize,
  ]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleFilterReset = () => {
    setStatusFilter('all');
    setStartDateFilter('');
    setEndDateFilter('');
    setMinAmountFilter('');
    setMaxAmountFilter('');
    setSearchTerm('');
    setCurrentPage(1);
    setActiveTab('all'); // Reset tab too
  };

  const handleExportCsv = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (activeTab === 'disputes') {
        queryParams.append('status', 'disputed');
      } else if (activeTab === 'chargebacks') {
        queryParams.append('status', 'chargeback');
      } else if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }
      if (startDateFilter) queryParams.append('startDate', startDateFilter);
      if (endDateFilter) queryParams.append('endDate', endDateFilter);
      if (minAmountFilter) queryParams.append('minAmount', minAmountFilter);
      if (maxAmountFilter) queryParams.append('maxAmount', maxAmountFilter);
      if (searchTerm) queryParams.append('search', searchTerm);

      const response = await fetch(`/api/admin/payments/export-csv?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export payments');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Export failed: ${error.message}`);
    }
  }, [activeTab, statusFilter, startDateFilter, endDateFilter, minAmountFilter, maxAmountFilter, searchTerm]);


  const totalPages = Math.ceil(totalPayments / pageSize);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>Admin Payments Monitoring</h1>

      {/* Revenue Metrics */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', minWidth: '200px' }}>
          <h3>Today's Revenue</h3>
          <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
            {metrics ? formatCurrency(metrics.todayTotal, 'USD') : 'N/A'}
          </p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', minWidth: '200px' }}>
          <h3>This Week's Revenue</h3>
          <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
            {metrics ? formatCurrency(metrics.weekTotal, 'USD') : 'N/A'}
          </p>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', minWidth: '200px' }}>
          <h3>This Month's Revenue</h3>
          <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
            {metrics ? formatCurrency(metrics.monthTotal, 'USD') : 'N/A'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', display: 'flex' }}>
        <button
          onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
          style={{
            padding: '10px 15px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'all' ? '2px solid #007bff' : 'none',
            fontWeight: activeTab === 'all' ? 'bold' : 'normal',
          }}
        >
          All Payments
        </button>
        <button
          onClick={() => { setActiveTab('disputes'); setCurrentPage(1); }}
          style={{
            padding: '10px 15px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'disputes' ? '2px solid #007bff' : 'none',
            fontWeight: activeTab === 'disputes' ? 'bold' : 'normal',
            color: activeTab === 'disputes' ? 'red' : 'inherit' // Highlight disputes
          }}
        >
          Dispute Queue
        </button>
        <button
          onClick={() => { setActiveTab('chargebacks'); setCurrentPage(1); }}
          style={{
            padding: '10px 15px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'chargebacks' ? '2px solid #007bff' : 'none',
            fontWeight: activeTab === 'chargebacks' ? 'bold' : 'normal',
            color: activeTab === 'chargebacks' ? 'darkred' : 'inherit' // Highlight chargebacks
          }}
        >
          Chargeback Alerts
        </button>
      </div>

      {/* Filters Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', background: '#f9f9f9' }}>
        <div>
          <label htmlFor="status-filter" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            disabled={activeTab === 'disputes' || activeTab === 'chargebacks'} // Disable if tab overrides status
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            {paymentStatuses.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="start-date-filter" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Start Date:</label>
          <input
            type="date"
            id="start-date-filter"
            value={startDateFilter}
            onChange={(e) => { setStartDateFilter(e.target.value); setCurrentPage(1); }}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label htmlFor="end-date-filter" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>End Date:</label>
          <input
            type="date"
            id="end-date-filter"
            value={endDateFilter}
            onChange={(e) => { setEndDateFilter(e.target.value); setCurrentPage(1); }}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label htmlFor="min-amount-filter" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Min Amount:</label>
          <input
            type="number"
            id="min-amount-filter"
            value={minAmountFilter}
            onChange={(e) => { setMinAmountFilter(e.target.value); setCurrentPage(1); }}
            placeholder="Min amount"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label htmlFor="max-amount-filter" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Max Amount:</label>
          <input
            type="number"
            id="max-amount-filter"
            value={maxAmountFilter}
            onChange={(e) => { setMaxAmountFilter(e.target.value); setCurrentPage(1); }}
            placeholder="Max amount"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label htmlFor="search-term" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Search (Order ID, Email):</label>
          <input
            type="text"
            id="search-term"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search payments..."
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <button
            onClick={handleFilterReset}
            style={{ padding: '10px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reset Filters
          </button>
          <button
            onClick={handleExportCsv}
            style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Loading, Error, or Payments Table */}
      {loading ? (
        <p>Loading payments...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : payments.length === 0 ? (
        <p>No payments found matching your criteria.</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ background: '#f2f2f2' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Tenant</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Customer Email</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Order ID</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Processor ID</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Fee</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.id.substring(0, 8)}...</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.tenantName}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{formatCurrency(payment.amount, payment.currency)}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', color:
                      payment.status === 'completed' ? 'green' :
                      payment.status === 'failed' ? 'red' :
                      payment.status === 'disputed' ? 'orange' :
                      payment.status === 'chargeback' ? 'darkred' : 'inherit'
                    }}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(payment.transactionDate).toLocaleDateString()}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.customerEmail}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.merchantOrderId || 'N/A'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{payment.processorTransactionId || 'N/A'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {payment.feeAmount !== undefined ? formatCurrency(payment.feeAmount, payment.currency) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <div>
              Page {currentPage} of {totalPages} (Total: {totalPayments} payments)
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ padding: '8px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                style={{ padding: '8px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPaymentsPage;