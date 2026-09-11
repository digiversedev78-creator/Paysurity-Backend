'use client';

import React, { useEffect, useState } from 'react';

// Define interfaces for API responses
interface SalesTaxByState {
  state: string;
  amount: number;
}

interface NexusThresholdWarning {
  state: string;
  currentSales: number;
  threshold: number;
  warningMessage: string;
}

interface NexusSummary {
  salesTaxCollectedByState: SalesTaxByState[];
  nexusThresholdWarnings: NexusThresholdWarning[];
}

interface TaxRate {
  category: string;
  rate: number; // Stored as a decimal (e.g., 0.075 for 7.5%)
  description: string;
}

interface TaxRatesResponse {
  taxRatesByCategory: TaxRate[];
}

const TaxDashboardPage: React.FC = () => {
  const [nexusSummary, setNexusSummary] = useState<NexusSummary | null>(null);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loadingNexus, setLoadingNexus] = useState<boolean>(true);
  const [loadingRates, setLoadingRates] = useState<boolean>(true);
  const [errorNexus, setErrorNexus] = useState<string | null>(null);
  const [errorRates, setErrorRates] = useState<string | null>(null);

  useEffect(() => {
    // Fetch Nexus Summary
    const fetchNexusSummary = async () => {
      try {
        setLoadingNexus(true);
        setErrorNexus(null);
        // Assuming API calls go through a local proxy or Next.js API route
        // which then forwards to the actual backend GET /tax/nexus-summary
        const response = await fetch('/api/tax/nexus-summary');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: NexusSummary = await response.json();
        setNexusSummary(data);
      } catch (error: any) {
        console.error("Failed to fetch nexus summary:", error);
        setErrorNexus(error.message || "Failed to load nexus summary.");
      } finally {
        setLoadingNexus(false);
      }
    };

    // Fetch Tax Rates
    const fetchTaxRates = async () => {
      try {
        setLoadingRates(true);
        setErrorRates(null);
        // Assuming API calls go through a local proxy or Next.js API route
        // which then forwards to the actual backend GET /tax/rates
        const response = await fetch('/api/tax/rates');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: TaxRatesResponse = await response.json();
        setTaxRates(data.taxRatesByCategory);
      } catch (error: any) {
        console.error("Failed to fetch tax rates:", error);
        setErrorRates(error.message || "Failed to load tax rates.");
      } finally {
        setLoadingRates(false);
      }
    };

    fetchNexusSummary();
    fetchTaxRates();
  }, []);

  const handleExportReport = async () => {
    try {
      // Assuming a backend endpoint that generates and serves the CSV report
      const response = await fetch('/api/tax/export-report', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Authorization headers would be handled by the client's auth system
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to export report: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error exporting report:", error);
      alert(`Error exporting report: ${error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Tax Management Dashboard</h1>

      <section style={styles.section}>
        <div style={styles.sectionHeaderContainer}>
            <h2 style={styles.sectionHeader}>Sales Tax Overview</h2>
            <button onClick={handleExportReport} style={styles.exportButton}>Export Tax Report (CSV)</button>
        </div>
        {loadingNexus && <p>Loading sales tax overview...</p>}
        {errorNexus && <p style={styles.errorText}>Error: {errorNexus}</p>}
        {nexusSummary && (
          <div>
            <h3>Sales Tax Collected This Month by State</h3>
            {nexusSummary.salesTaxCollectedByState.length > 0 ? (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>State</th>
                    <th style={styles.th}>Amount Collected</th>
                  </tr>
                </thead>
                <tbody>
                  {nexusSummary.salesTaxCollectedByState.map((item) => (
                    <tr key={item.state}>
                      <td style={styles.td}>{item.state}</td>
                      <td style={styles.td}>${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No sales tax collected this month.</p>
            )}

            <h3 style={styles.h3}>Nexus Threshold Warnings</h3>
            {nexusSummary.nexusThresholdWarnings.length > 0 ? (
              <div style={styles.warningContainer}>
                {nexusSummary.nexusThresholdWarnings.map((warning) => (
                  <p key={warning.state} style={styles.warningText}>
                    <strong>{warning.state}:</strong> {warning.warningMessage} (Current Sales: ${warning.currentSales.toFixed(2)} / Threshold: ${warning.threshold.toFixed(2)})
                  </p>
                ))}
              </div>
            ) : (
              <p>No nexus threshold warnings at this time.</p>
            )}
          </div>
        )}
        {!loadingNexus && !errorNexus && !nexusSummary && (
          <p>No sales tax overview data available.</p>
        )}
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionHeader}>Tax Rates by Category</h2>
        {loadingRates && <p>Loading tax rates...</p>}
        {errorRates && <p style={styles.errorText}>Error: {errorRates}</p>}
        {taxRates.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Rate</th>
                <th style={styles.th}>Description</th>
              </tr>
            </thead>
            <tbody>
              {taxRates.map((rate) => (
                <tr key={rate.category}>
                  <td style={styles.td}>{rate.category}</td>
                  <td style={styles.td}>{(rate.rate * 100).toFixed(2)}%</td>
                  <td style={styles.td}>{rate.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loadingRates && !errorRates && taxRates.length === 0 && (
          <p>No tax rates found.</p>
        )}
      </section>
    </div>
  );
};

// Basic inline styles for demonstration purposes.
// In a production application, these would typically come from
// a dedicated CSS file, CSS Modules, Tailwind CSS, or a UI component library.
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    color: '#333',
  },
  header: {
    color: '#0056b3',
    marginBottom: '30px',
    borderBottom: '1px solid #eee',
    paddingBottom: '15px',
    textAlign: 'center',
  },
  section: {
    marginBottom: '40px',
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  sectionHeaderContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionHeader: {
    color: '#0056b3',
    fontSize: '1.8em',
    margin: 0,
  },
  h3: {
    color: '#555',
    marginTop: '25px',
    marginBottom: '15px',
  },
  exportButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 18px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
    marginTop: '15px',
  },
  th: {
    border: '1px solid #ddd',
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#f2f2f2',
    color: '#333',
  },
  td: {
    border: '1px solid #ddd',
    padding: '10px',
    textAlign: 'left',
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeeba',
    borderRadius: '5px',
    padding: '15px',
    marginTop: '15px',
  },
  warningText: {
    color: '#856404',
    margin: '5px 0',
    lineHeight: '1.5',
  },
  errorText: {
    color: '#dc3545',
    fontWeight: 'bold',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '5px',
    padding: '10px',
    margin: '15px 0',
  },
};

export default TaxDashboardPage;