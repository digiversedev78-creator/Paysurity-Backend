"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

// --- Type Definitions ---
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  hourlyRate: number; // Example, could be more complex with salary, etc.
}

interface EmployeeHoursEntry {
  employeeId: string;
  firstName: string;
  lastName: string;
  hoursWorked: number;
  rate: number; // Effective rate for this period
}

interface TaxBreakdown {
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  otherDeductions: number; // e.g., 401k, health insurance
  employerTaxes: number; // Example, if shown for employer's portion
}

interface CalculatedPayResult {
  payrollId: string; // A temporary ID for calculation or a correlation ID
  employeePayslips: Array<{
    employeeId: string;
    grossPay: number;
    netPay: number;
    taxes: TaxBreakdown;
    deductions: number; // Sum of all employee deductions (excluding taxes)
    employerCost: number; // Total cost to employer for this employee (gross + employer taxes + benefits)
  }>;
  totalGrossPay: number;
  totalNetPay: number;
  totalTaxes: TaxBreakdown; // Sum of all employee and employer taxes
  totalEmployerCost: number;
}

interface PayPeriod {
  startDate: string; // ISO date string e.g., 'YYYY-MM-DD'
  endDate: string; // ISO date string
}

// --- Helper Components (for basic UI styling) ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white shadow-lg rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}> = ({ onClick, children, disabled, variant = 'primary', type = 'button', className }) => {
  const baseStyle = "px-6 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-200";
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500";
      break;
    case 'secondary':
      variantStyle = "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400";
      break;
    case 'danger':
      variantStyle = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500";
      break;
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`${baseStyle} ${variantStyle} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    {...props}
  />
);

const DatePicker: React.FC<{
  label: string;
  value: string; // ISO date string
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}> = ({ label, value, onChange, min, max }) => (
  <div>
    <label htmlFor={label} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <Input
      type="date"
      id={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
    />
  </div>
);

// --- Step Components ---

// Step 1: Select Pay Period
interface Step1Props {
  payPeriod: PayPeriod;
  setPayPeriod: (period: PayPeriod) => void;
  onNext: () => void;
  isLoading: boolean;
  error: string | null;
}

const Step1SelectPayPeriod: React.FC<Step1Props> = ({ payPeriod, setPayPeriod, onNext, isLoading, error }) => {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleStartDateChange = useCallback((date: string) => {
    setPayPeriod({ ...payPeriod, startDate: date });
  }, [payPeriod, setPayPeriod]);

  const handleEndDateChange = useCallback((date: string) => {
    setPayPeriod({ ...payPeriod, endDate: date });
  }, [payPeriod, setPayPeriod]);

  const isNextDisabled = !payPeriod.startDate || !payPeriod.endDate || new Date(payPeriod.startDate) > new Date(payPeriod.endDate);

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Step 1: Select Pay Period</h2>
      <div className="space-y-4">
        <DatePicker
          label="Start Date"
          value={payPeriod.startDate}
          onChange={handleStartDateChange}
          max={payPeriod.endDate || today}
        />
        <DatePicker
          label="End Date"
          value={payPeriod.endDate}
          onChange={handleEndDateChange}
          min={payPeriod.startDate}
          max={today}
        />
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <div className="mt-8 flex justify-end">
        <Button onClick={onNext} disabled={isNextDisabled || isLoading}>
          {isLoading ? 'Loading...' : 'Next'}
        </Button>
      </div>
    </Card>
  );
};

// Step 2: Review Employee Hours
interface Step2Props {
  payPeriod: PayPeriod;
  employeeHours: EmployeeHoursEntry[];
  setEmployeeHours: (hours: EmployeeHoursEntry[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
  error: string | null;
}

const Step2ReviewEmployeeHours: React.FC<Step2Props> = ({
  payPeriod,
  employeeHours,
  setEmployeeHours,
  onNext,
  onPrevious,
  isLoading,
  error,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (employeeHours.length === 0 && payPeriod.startDate && payPeriod.endDate) {
        setInternalLoading(true);
        setInternalError(null);
        try {
          // Simulate API call to fetch employees and their hours for the period
          // In a real app:
          // const response = await fetch(`/api/payroll/hours?startDate=${payPeriod.startDate}&endDate=${payPeriod.endDate}`);
          // if (!response.ok) throw new Error('Failed to fetch employee hours.');
          // const data = await response.json();
          // setEmployeeHours(data.employeeHours);

          // Mock data for demonstration
          await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
          const mockEmployees: Employee[] = [
            { id: 'emp001', firstName: 'Alice', lastName: 'Smith', hourlyRate: 25 },
            { id: 'emp002', firstName: 'Bob', lastName: 'Johnson', hourlyRate: 30 },
            { id: 'emp003', firstName: 'Charlie', lastName: 'Brown', hourlyRate: 20 },
            { id: 'emp004', firstName: 'Diana', lastName: 'Prince', hourlyRate: 35 },
          ];

          const initialHours = mockEmployees.map(emp => ({
            employeeId: emp.id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            hoursWorked: Math.floor(Math.random() * 40) + 20, // Random hours for demo
            rate: emp.hourlyRate,
          }));
          setEmployeeHours(initialHours);
        } catch (err: any) {
          setInternalError(err.message || "Failed to load employee hours.");
        } finally {
          setInternalLoading(false);
        }
      }
    };
    fetchEmployeeData();
  }, [payPeriod, employeeHours.length, setEmployeeHours]);

  const handleHoursChange = useCallback((employeeId: string, hours: number) => {
    setEmployeeHours(
      employeeHours.map((emp: EmployeeHoursEntry) => (emp.employeeId === employeeId ? { ...emp, hoursWorked: hours } : emp))
    );
  }, [setEmployeeHours, employeeHours]);

  const isNextDisabled = isLoading || internalLoading || employeeHours.some(e => isNaN(e.hoursWorked) || e.hoursWorked < 0);

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Step 2: Review Employee Hours</h2>
      <p className="text-gray-600 mb-4">
        Pay Period: <span className="font-medium">{payPeriod.startDate} to {payPeriod.endDate}</span>
      </p>

      {(isLoading || internalLoading) ? (
        <p className="text-indigo-600">Loading employee hours...</p>
      ) : (error || internalError) ? (
        <p className="text-red-500">{error || internalError}</p>
      ) : employeeHours.length === 0 ? (
        <p className="text-gray-600">No employees found for this pay period. Add employees or adjust dates.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hourly Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours Worked
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeeHours.map((entry) => (
                <tr key={entry.employeeId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.firstName} {entry.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${entry.rate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Input
                      type="number"
                      min="0"
                      value={entry.hoursWorked}
                      onChange={(e) => handleHoursChange(entry.employeeId, parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-8 flex justify-between">
        <Button onClick={onPrevious} variant="secondary">Previous</Button>
        <Button onClick={onNext} disabled={isNextDisabled}>
          Next
        </Button>
      </div>
    </Card>
  );
};

// Step 3: Review Calculated Pay
interface Step3Props {
  payPeriod: PayPeriod;
  employeeHours: EmployeeHoursEntry[];
  calculatedPay: CalculatedPayResult | null;
  setCalculatedPay: (pay: CalculatedPayResult) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
  error: string | null;
}

const Step3ReviewCalculatedPay: React.FC<Step3Props> = ({
  payPeriod,
  employeeHours,
  calculatedPay,
  setCalculatedPay,
  onNext,
  onPrevious,
  isLoading,
  error,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  useEffect(() => {
    const calculatePay = async () => {
      // Only recalculate if payPeriod or employeeHours changed, and we don't have a calculation yet
      // or if the calculation is stale (e.g., payrollId doesn't match a new state hash)
      if (!calculatedPay && employeeHours.length > 0 && payPeriod.startDate && payPeriod.endDate && !internalLoading) {
        setInternalLoading(true);
        setInternalError(null);
        try {
          // Simulate API call to calculate pay
          // const response = await fetch('/api/payroll/calculate', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ payPeriod, employeeHours }),
          // });
          // if (!response.ok) throw new Error('Failed to calculate payroll.');
          // const data = await response.json();
          // setCalculatedPay(data);

          // Mock calculation for demonstration
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

          const employeePayslips = employeeHours.map(emp => {
            const gross = emp.hoursWorked * emp.rate;
            // Example tax rates and deductions - in a real system, these would be complex and dynamic
            const federalTax = gross * 0.15;
            const stateTax = gross * 0.05;
            const socialSecurity = gross * 0.062;
            const medicare = gross * 0.0145;
            const otherDeductions = gross * 0.02; // e.g., 401k contribution, health insurance premium
            const totalEmployeeTaxes = federalTax + stateTax + socialSecurity + medicare;
            const netPay = gross - totalEmployeeTaxes - otherDeductions;

            const employerFICA = (gross > 0 ? gross * 0.0765 : 0); // Employer's matching FICA (SS+Medicare)
            const employerUnemployment = (gross > 0 ? gross * 0.006 : 0); // Example unemployment tax

            return {
              employeeId: emp.employeeId,
              grossPay: gross,
              netPay: netPay,
              taxes: {
                federalTax,
                stateTax,
                socialSecurity,
                medicare,
                otherDeductions,
                employerTaxes: employerFICA + employerUnemployment,
              },
              deductions: otherDeductions,
              employerCost: gross + employerFICA + employerUnemployment + (gross * 0.01), // Gross + Employer Taxes + Benefits/Other Costs
            };
          });

          const totalGrossPay = employeePayslips.reduce((sum, p) => sum + p.grossPay, 0);
          const totalNetPay = employeePayslips.reduce((sum, p) => sum + p.netPay, 0);
          const totalEmployerCost = employeePayslips.reduce((sum, p) => sum + p.employerCost, 0);

          const totalTaxes: TaxBreakdown = employeePayslips.reduce((acc, p) => ({
            federalTax: acc.federalTax + p.taxes.federalTax,
            stateTax: acc.stateTax + p.taxes.stateTax,
            socialSecurity: acc.socialSecurity + p.taxes.socialSecurity,
            medicare: acc.medicare + p.taxes.medicare,
            otherDeductions: acc.otherDeductions + p.taxes.otherDeductions,
            employerTaxes: acc.employerTaxes + p.taxes.employerTaxes,
          }), { federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, otherDeductions: 0, employerTaxes: 0 });

          const mockCalculation: CalculatedPayResult = {
            payrollId: `calc-${Date.now()}`,
            employeePayslips,
            totalGrossPay,
            totalNetPay,
            totalTaxes,
            totalEmployerCost,
          };

          setCalculatedPay(mockCalculation);
        } catch (err: any) {
          setInternalError(err.message || "Failed to calculate payroll.");
        } finally {
          setInternalLoading(false);
        }
      }
    };
    calculatePay();
  }, [payPeriod, employeeHours, calculatedPay, setCalculatedPay, internalLoading]); // Added internalLoading to dep array

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Step 3: Review Calculated Pay</h2>
      <p className="text-gray-600 mb-4">
        Pay Period: <span className="font-medium">{payPeriod.startDate} to {payPeriod.endDate}</span>
      </p>

      {(isLoading || internalLoading) ? (
        <p className="text-indigo-600">Calculating payroll...</p>
      ) : (error || internalError) ? (
        <p className="text-red-500">{error || internalError}</p>
      ) : !calculatedPay ? (
        <p className="text-gray-600">No calculation data available. Please go back and ensure hours are entered.</p>
      ) : (
        <>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Pay
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Taxes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employer Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculatedPay.employeePayslips.map((payslip) => {
                  const employee = employeeHours.find(eh => eh.employeeId === payslip.employeeId);
                  const totalEmployeeTaxes = payslip.taxes.federalTax + payslip.taxes.stateTax + payslip.taxes.socialSecurity + payslip.taxes.medicare;
                  return (
                    <tr key={payslip.employeeId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employee?.firstName} {employee?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(payslip.grossPay)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(totalEmployeeTaxes)}
                        <details className="text-xs text-gray-500 mt-1">
                            <summary className="cursor-pointer hover:text-indigo-600">Details</summary>
                            <ul className="list-disc ml-4">
                                <li>Federal: {formatCurrency(payslip.taxes.federalTax)}</li>
                                <li>State: {formatCurrency(payslip.taxes.stateTax)}</li>
                                <li>Social Security: {formatCurrency(payslip.taxes.socialSecurity)}</li>
                                <li>Medicare: {formatCurrency(payslip.taxes.medicare)}</li>
                            </ul>
                        </details>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(payslip.deductions)}
                        {payslip.taxes.otherDeductions > 0 && (
                             <details className="text-xs text-gray-500 mt-1">
                                <summary className="cursor-pointer hover:text-indigo-600">Details</summary>
                                <ul className="list-disc ml-4">
                                    <li>Other Deductions: {formatCurrency(payslip.taxes.otherDeductions)}</li>
                                </ul>
                            </details>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(payslip.netPay)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(payslip.employerCost)}
                        <details className="text-xs text-gray-500 mt-1">
                            <summary className="cursor-pointer hover:text-indigo-600">Details</summary>
                            <ul className="list-disc ml-4">
                                <li>Gross Pay: {formatCurrency(payslip.grossPay)}</li>
                                <li>Employer Taxes: {formatCurrency(payslip.taxes.employerTaxes)}</li>
                                {/* Add other employer costs here if available */}
                            </ul>
                        </details>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-6">
            <div className="w-full md:w-1/2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Summary</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Total Gross Pay:</span>
                  <span className="font-medium">{formatCurrency(calculatedPay.totalGrossPay)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Employee Taxes:</span>
                  <span className="font-medium">{formatCurrency(
                      calculatedPay.totalTaxes.federalTax +
                      calculatedPay.totalTaxes.stateTax +
                      calculatedPay.totalTaxes.socialSecurity +
                      calculatedPay.totalTaxes.medicare
                  )}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Deductions:</span>
                  <span className="font-medium">{formatCurrency(calculatedPay.totalTaxes.otherDeductions)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Net Pay:</span>
                  <span>{formatCurrency(calculatedPay.totalNetPay)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span>Total Employer Cost:</span>
                  <span className="font-medium">{formatCurrency(calculatedPay.totalEmployerCost)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 flex justify-between">
        <Button onClick={onPrevious} variant="secondary">Previous</Button>
        <Button onClick={onNext} disabled={!calculatedPay || isLoading || internalLoading}>
          {isLoading || internalLoading ? 'Calculating...' : 'Next'}
        </Button>
      </div>
    </Card>
  );
};

// Step 4: Confirm + Submit
interface Step4Props {
  payPeriod: PayPeriod;
  calculatedPay: CalculatedPayResult | null;
  onSubmit: () => void;
  onPrevious: () => void;
  isLoading: boolean;
  error: string | null;
  payrollRunId: string | null; // Indicates if already submitted (e.g., from a reload)
}

const Step4ConfirmSubmit: React.FC<Step4Props> = ({
  payPeriod,
  calculatedPay,
  onSubmit,
  onPrevious,
  isLoading,
  error,
  payrollRunId,
}) => {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  if (!calculatedPay) {
    return (
      <Card>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Step 4: Confirm & Submit</h2>
        <p className="text-red-500">Error: No calculated pay data available. Please go back.</p>
        <div className="mt-8 flex justify-start">
            <Button onClick={onPrevious} variant="secondary">Previous</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Step 4: Confirm & Submit</h2>
      <p className="text-lg text-gray-700 mb-6">
        You are about to submit payroll for the period{' '}
        <span className="font-bold">{payPeriod.startDate} to {payPeriod.endDate}</span>.
      </p>

      <div className="mb-6 bg-gray-50 p-4 rounded-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Payroll Summary</h3>
        <div className="space-y-2 text-gray-700">
          <div className="flex justify-between">
            <span>Number of Employees:</span>
            <span className="font-medium">{calculatedPay.employeePayslips.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Gross Pay:</span>
            <span className="font-medium">{formatCurrency(calculatedPay.totalGrossPay)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Net Pay:</span>
            <span className="font-medium">{formatCurrency(calculatedPay.totalNetPay)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Employer Cost:</span>
            <span className="font-medium">{formatCurrency(calculatedPay.totalEmployerCost)}</span>
          </div>
        </div>
      </div>

      <p className="text-red-600 font-medium mb-6">
        Please review all details carefully before submitting. This action cannot be easily reversed.
      </p>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="mt-8 flex justify-between">
        <Button onClick={onPrevious} variant="secondary" disabled={isLoading}>Previous</Button>
        <Button onClick={onSubmit} disabled={isLoading || !!payrollRunId} type="submit">
          {isLoading ? 'Submitting...' : payrollRunId ? 'Payroll Submitted!' : 'Confirm & Submit Payroll'}
        </Button>
      </div>
    </Card>
  );
};

// Step 5: Download Pay Stubs
interface Step5Props {
  payrollRunId: string | null;
  onDone: () => void;
  error: string | null;
  calculatedPay: CalculatedPayResult | null;
  payPeriod: PayPeriod;
  employeeHours: EmployeeHoursEntry[]; // Need employee names for download links
}

const Step5DownloadPayStubs: React.FC<Step5Props> = ({ payrollRunId, onDone, error, calculatedPay, payPeriod, employeeHours }) => {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  if (!payrollRunId) {
    return (
      <Card>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Step 5: Payroll Complete!</h2>
        <p className="text-red-500">Error: No payroll run ID found. Please contact support.</p>
        <div className="mt-8 flex justify-end">
          <Button onClick={onDone}>Done</Button>
        </div>
      </Card>
    );
  }

  const handleDownloadAll = () => {
    alert(`Simulating download of all pay stubs for Payroll Run ID: ${payrollRunId}`);
    // Example: window.open(`/api/payroll/runs/${payrollRunId}/paystubs/all`, '_blank');
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Step 5: Payroll Complete!</h2>
      <p className="text-green-600 text-lg mb-4 font-semibold">
        Payroll for the period {payPeriod.startDate} to {payPeriod.endDate} has been successfully submitted!
      </p>
      <p className="text-gray-700 mb-6">
        Payroll Run ID: <span className="font-mono bg-gray-100 p-1 rounded text-sm">{payrollRunId}</span>
      </p>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Download Pay Stubs</h3>
        <p className="text-gray-600 mb-4">
          You can download individual pay stubs or a single file containing all of them.
        </p>
        <div className="space-y-3">
          {calculatedPay?.employeePayslips.map(payslip => {
            const employee = employeeHours.find(eh => eh.employeeId === payslip.employeeId);
            return (
              <div key={payslip.employeeId} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                <span className="text-gray-800 font-medium">
                  {employee?.firstName} {employee?.lastName} (Net: {formatCurrency(payslip.netPay)})
                </span>
                <Link
                  href={`/api/payroll/runs/${payrollRunId}/paystubs/${payslip.employeeId}`} // Placeholder URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                  onClick={() => alert(`Simulating download for ${employee?.firstName} ${employee?.lastName}`)}
                >
                  Download Pay Stub
                </Link>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleDownloadAll} variant="primary">
            Download All Pay Stubs (.zip)
          </Button>
        </div>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="mt-8 flex justify-end">
        <Button onClick={onDone} variant="secondary">Go to Payroll History</Button>
      </div>
    </Card>
  );
};


// --- Main PayrollRunPage Component ---
export default function PayrollRunPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [payPeriod, setPayPeriod] = useState<PayPeriod>({ startDate: '', endDate: '' });
  const [employeeHours, setEmployeeHours] = useState<EmployeeHoursEntry[]>([]);
  const [calculatedPay, setCalculatedPay] = useState<CalculatedPayResult | null>(null);
  const [payrollRunId, setPayrollRunId] = useState<string | null>(null); // ID returned after successful submission
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset calculatedPay if payPeriod or employeeHours change to force recalculation on Step 3
  useEffect(() => {
    // Only reset if we are on a step before calculation or on the calculation step itself,
    // and a value has actually changed that impacts calculation.
    // If on Step 4/5, don't reset calculatedPay as it's finalized.
    if (currentStep <= 3) {
        setCalculatedPay(null);
    }
  }, [payPeriod.startDate, payPeriod.endDate, employeeHours, currentStep]);


  const handleNext = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (currentStep === 1) {
        if (!payPeriod.startDate || !payPeriod.endDate) {
          throw new Error("Please select a valid pay period.");
        }
      } else if (currentStep === 2) {
        if (employeeHours.length === 0) {
          throw new Error("Please add employees or ensure hours are fetched.");
        }
        if (employeeHours.some(e => isNaN(e.hoursWorked) || e.hoursWorked < 0)) {
          throw new Error("All hours worked must be valid positive numbers.");
        }
      } else if (currentStep === 3) {
        if (!calculatedPay) {
          throw new Error("Pay calculation is not complete. Please wait or go back.");
        }
      }
      setCurrentStep(prev => prev + 1);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, payPeriod, employeeHours, calculatedPay]);

  const handlePrevious = useCallback(() => {
    setError(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  const handleSubmitPayroll = useCallback(async () => {
    if (!calculatedPay || !payPeriod.startDate || !payPeriod.endDate) {
      setError("Cannot submit: payroll data or pay period is missing.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Simulate API POST /payroll/runs
      // const response = await fetch('/api/payroll/runs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ payPeriod, employeeHours, calculatedPay }),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Failed to submit payroll.');
      // }
      // const result = await response.json();
      // setPayrollRunId(result.payrollRunId);

      // Mock successful submission
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      const mockRunId = `PRN-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setPayrollRunId(mockRunId);

      setCurrentStep(5); // Advance to the download step
    } catch (err: any) {
      setError(err.message || "Failed to submit payroll.");
    } finally {
      setIsLoading(false);
    }
  }, [calculatedPay, payPeriod]);

  const handleDone = useCallback(() => {
    // Navigate to payroll history or dashboard
    window.location.href = '/dashboard/payroll'; // Example navigation
  }, []);

  const stepTitles = [
    'Select Pay Period',
    'Review Employee Hours',
    'Review Calculated Pay',
    'Confirm & Submit',
    'Download Pay Stubs',
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Run Payroll Wizard</h1>

        {/* Progress Indicator */}
        <div className="mb-10 flex justify-between items-center relative after:absolute after:bottom-[calc(50%-1px)] after:left-0 after:right-0 after:h-0.5 after:bg-gray-200 after:z-0">
          {stepTitles.map((title, index) => (
            <div
              key={index}
              className={`relative z-10 flex flex-col items-center flex-1 cursor-pointer transition-colors duration-200
                ${currentStep > index + 1 ? 'text-indigo-600' : 'text-gray-500'}
              `}
              onClick={() => {
                // Allow navigation back to previous completed steps
                if (index + 1 < currentStep || (index + 1 === currentStep && currentStep <= 3)) { // Allow navigating back to any step before confirm, or to current step
                    setCurrentStep(index + 1);
                    setError(null); // Clear error when navigating
                }
                // Disallow direct forward navigation to enforce wizard flow unless on the current step
              }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-2 transition-colors duration-200
                  ${currentStep > index + 1 ? 'bg-indigo-600' : currentStep === index + 1 ? 'bg-indigo-500' : 'bg-gray-400'}
                `}
              >
                {index + 1}
              </div>
              <span className="text-sm text-center">
                {title}
              </span>
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{error}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setError(null)}>
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
              </span>
            </div>
          )}

          {currentStep === 1 && (
            <Step1SelectPayPeriod
              payPeriod={payPeriod}
              setPayPeriod={setPayPeriod}
              onNext={handleNext}
              isLoading={isLoading}
              error={error}
            />
          )}
          {currentStep === 2 && (
            <Step2ReviewEmployeeHours
              payPeriod={payPeriod}
              employeeHours={employeeHours}
              setEmployeeHours={setEmployeeHours}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isLoading={isLoading}
              error={error}
            />
          )}
          {currentStep === 3 && (
            <Step3ReviewCalculatedPay
              payPeriod={payPeriod}
              employeeHours={employeeHours}
              calculatedPay={calculatedPay}
              setCalculatedPay={setCalculatedPay}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isLoading={isLoading}
              error={error}
            />
          )}
          {currentStep === 4 && (
            <Step4ConfirmSubmit
              payPeriod={payPeriod}
              calculatedPay={calculatedPay}
              onSubmit={handleSubmitPayroll}
              onPrevious={handlePrevious}
              isLoading={isLoading}
              error={error}
              payrollRunId={payrollRunId}
            />
          )}
          {currentStep === 5 && (
            <Step5DownloadPayStubs
              payrollRunId={payrollRunId}
              onDone={handleDone}
              error={error}
              calculatedPay={calculatedPay}
              payPeriod={payPeriod}
              employeeHours={employeeHours}
            />
          )}
        </div>
      </div>
    </div>
  );
}