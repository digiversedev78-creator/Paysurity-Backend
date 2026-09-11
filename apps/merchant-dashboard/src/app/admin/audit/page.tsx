'use client';
import React, { useState, useEffect, useCallback } from 'react';

// Define interfaces for data
interface AuditLogEvent {
  id: string;
  timestamp: string; // ISO 8601 string
  userId: string;
  userName: string; // Assuming the API provides user name
  action: string;
  resource: string;
  ipAddress: string;
  traceId: string;
  // If the audit log event itself can have an 'amount' associated with it
  // (e.g., an audit log of a transaction), uncomment and use this:
  amount?: number;
}

interface AuditLogResponse {
  data: AuditLogEvent[];
  total: number;
  page: number;
  pageSize: number;
}

interface Filters {
  tenantId: string;
  userId: string;
  action: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const SUSPICIOUS_AMOUNT_THRESHOLD = 10000; // Example: $10,000
const SUSPICIOUS_OFF_HOURS_START_UTC = 22; // 10 PM UTC
const SUSPICIOUS_OFF_HOURS_END_UTC = 6;    // 6 AM UTC
const SUSPICIOUS_WEEKEND_DAYS = [0, 6]; // Sunday (0) and Saturday (6)

export default function AdminAuditLogPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    tenantId: '',
    userId: '',
    action: '',
    startDate: '',
    endDate: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [totalRecords, setTotalRecords] = useState(0);

  const totalPages = Math.ceil(totalRecords / pageSize);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('pageSize', pageSize.toString());
      if (filters.tenantId) queryParams.append('tenantId', filters.tenantId);
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/audit-logs?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: AuditLogResponse = await response.json();
      setAuditLogs(data.data);
      setTotalRecords(data.total);
    } catch (e: any) {
      setError(`Failed to fetch audit logs: ${e.message}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setFilters({
      tenantId: '',
      userId: '',
      action: '',
      startDate: '',
      endDate: '',
    });
    setPage(1); // Reset to first page on clearing filters
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1); // Reset to first page on page size change
  };

  const exportToCSV = async () => {
    setError(null); // Clear previous errors before export
    try {
      const queryParams = new URLSearchParams();
      if (filters.tenantId) queryParams.append('tenantId', filters.tenantId);
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      // The backend should handle a specific endpoint or parameter for CSV export
      const response = await fetch(`/api/admin/audit-logs/export?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(`Failed to export audit logs: ${e.message}`);
      console.error(e);
    }
  };

  const isSuspiciousEvent = (event: AuditLogEvent): boolean => {
    const timestampDate = new Date(event.timestamp);

    // Check for large amounts
    if (event.amount !== undefined && event.amount >= SUSPICIOUS_AMOUNT_THRESHOLD) {
      return true;
    }

    // Check for off-hours/weekend (using UTC for consistency with server logs)
    const utcHour = timestampDate.getUTCHours();
    const utcDay = timestampDate.getUTCDay(); // 0 for Sunday, 6 for Saturday

    const isOffHours = (utcHour >= SUSPICIOUS_OFF_HOURS_START_UTC || utcHour < SUSPICIOUS_OFF_HOURS_END_UTC);
    const isWeekend = SUSPICIOUS_WEEKEND_DAYS.includes(utcDay);

    if (isOffHours || isWeekend) {
      return true;
    }

    return false;
  };

  // Basic inline styles for table and pagination buttons
  const tableHeaderStyle: React.CSSProperties = {
    padding: '12px',
    border: '1px solid #ddd',
    textAlign: 'left',
    backgroundColor: '#f8f8f8',
    whiteSpace: 'nowrap',
  };

  const tableCellStyle: React.CSSProperties = {
    padding: '12px',
    border: '1px solid #eee',
    verticalAlign: 'top',
    fontSize: '0.9em',
  };

  const paginationButtonStyle: React.CSSProperties = {
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    opacity: 1,
    transition: 'background-color 0.2s',
  };

  const disabledPaginationButtonStyle: React.CSSProperties = {
    ...paginationButtonStyle,
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Admin Audit Log</h1>

      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: '0', marginBottom: '15px', color: '#555' }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px 20px' }}>
          <div>
            <label htmlFor="tenantId" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>Tenant ID:</label>
            <input
              type="text"
              id="tenantId"
              name="tenantId"
              value={filters.tenantId}
              onChange={handleFilterChange}
              placeholder="e.g., tenant-abc-123"
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label htmlFor="userId" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>User ID:</label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              placeholder="e.g., user-xyz-456"
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label htmlFor="action" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>Action:</label>
            <input
              type="text"
              id="action"
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              placeholder="e.g., user.login, transaction.create"
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label htmlFor="startDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>Start Date:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label htmlFor="endDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9em' }}>End Date:</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
        <button
          onClick={handleClearFilters}
          style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' }}
        >
          Clear Filters
        </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={exportToCSV}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' }}
        >
          Export to CSV
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center', fontSize: '1.1em', color: '#007bff' }}>Loading audit logs...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '1.1em' }}>Error: {error}</p>}

      {!loading && !error && (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={tableHeaderStyle}>Timestamp</th>
                <th style={tableHeaderStyle}>User</th>
                <th style={tableHeaderStyle}>Action</th>
                <th style={tableHeaderStyle}>Resource</th>
                <th style={tableHeaderStyle}>IP Address</th>
                <th style={tableHeaderStyle}>Trace ID</th>
                <th style={tableHeaderStyle}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', color: '#666' }}>No audit logs found matching the current filters.</td>
                </tr>
              ) : (
                auditLogs.map((event) => (
                  <tr
                    key={event.id}
                    style={{
                      borderBottom: '1px solid #eee',
                      backgroundColor: isSuspiciousEvent(event) ? '#ffe0b2' : 'inherit', // Light orange for suspicious
                    }}
                  >
                    <td style={tableCellStyle}>{new Date(event.timestamp).toLocaleString()}</td>
                    <td style={tableCellStyle}>{event.userName} ({event.userId})</td>
                    <td style={tableCellStyle}>{event.action}</td>
                    <td style={tableCellStyle}>{event.resource}</td>
                    <td style={tableCellStyle}>{event.ipAddress}</td>
                    <td style={tableCellStyle}>{event.traceId}</td>
                    <td style={tableCellStyle}>{event.amount !== undefined ? `$${event.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #eee' }}>
            <div style={{ color: '#555', fontSize: '0.95em' }}>
              Showing {Math.min(totalRecords, (page - 1) * pageSize + 1)} - {Math.min(totalRecords, page * pageSize)} of {totalRecords} records
              (Page {page} of {totalPages === 0 ? 1 : totalPages})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                style={page === 1 ? disabledPaginationButtonStyle : paginationButtonStyle}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || totalPages === 0}
                style={page === totalPages || totalPages === 0 ? disabledPaginationButtonStyle : paginationButtonStyle}
              >
                Next
              </button>
              <select
                onChange={handlePageSizeChange}
                value={pageSize}
                style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '0.9em' }}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}