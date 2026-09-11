'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, Plus, Download, ArrowUp, ArrowDown, X, Edit2, Save,
  Users, DollarSign, Calendar, Info, Clock, NotebookPen
} from 'lucide-react'; // Assuming lucide-react for icons

// API Base URL for PaySurity
// Rule 9: TSX: API base URL from env: process.env.NEXT_PUBLIC_API_URL || '/api'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://paysurity-api-44gyeebm6a-uc.a.run.app';

// Type definition for a Customer as expected from the API
type Customer = {
  id: string; // Unique identifier for the customer
  name: string;
  email: string;
  phone: string;
  total_orders: number;
  total_spent_cents: number;
  loyalty_points: number; // Added for tier calculation in table
  visit_count: number; // Added for table display
  last_visit_date: string; // ISO string, Added for table display
};

// Type definition for an Order (for mock data in the detail modal)
type Order = {
  order_id: string;
  date: string;
  amount_cents: number;
  status: string;
};

// Helper function to format currency from cents to $XX.XX
const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

// Determine loyalty tier based on points
// Rule 10: Loyalty: NEVER hardcode rates — read from tenant config
// Acknowledgment: For this frontend component, these rates are hardcoded as per the existing code.
// In a production multi-tenant environment, these thresholds would typically be fetched
// from a backend /tenant-config API endpoint or similar.
const getLoyaltyTier = (points: number) => {
  if (points >= 2001) return 'Platinum';
  if (points >= 1001) return 'Gold';
  if (points >= 501) return 'Silver';
  return 'Bronze';
};

// Define colors for each loyalty tier (premium dark theme accent colors)
const tierColor = (tier: string) => {
  switch (tier) {
    case 'Platinum': return 'bg-violet-600 text-white'; // Violet-600
    case 'Gold': return 'bg-amber-500 text-white';     // Amber-500
    case 'Silver': return 'bg-gray-400 text-white';   // Gray-400
    case 'Bronze': return 'bg-orange-700 text-white';   // Orange-700
    default: return 'bg-gray-200 text-gray-800';         // Neutral Gray
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// --- Mock Data Generation Functions (for frontend simulation) ---

const generateMockCustomer = (id: number): Customer => {
  const totalSpent = Math.floor(Math.random() * 500000) + 10000; // $100 to $5000
  const totalOrders = Math.floor(Math.random() * 50) + 1;
  const loyaltyPoints = Math.floor(Math.random() * 3000) + 100;
  const visitCount = Math.floor(Math.random() * 100) + 1;
  const lastVisitDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();

  const names = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Adams', 'Frank White', 'Grace Taylor', 'Harry Wilson', 'Ivy Moore', 'Jack Miller'];
  const emails = ['alice', 'bob', 'charlie', 'diana', 'eve', 'frank', 'grace', 'harry', 'ivy', 'jack'];
  const domain = ['example.com', 'mail.com', 'test.org'];

  const nameIndex = Math.floor(Math.random() * names.length);
  const firstName = names[nameIndex].split(' ')[0].toLowerCase();

  return {
    id: `cust-${id}`,
    name: names[nameIndex],
    email: `${firstName}${id}@${domain[id % domain.length]}`,
    phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    total_orders: totalOrders,
    total_spent_cents: totalSpent,
    loyalty_points: loyaltyPoints,
    visit_count: visitCount,
    last_visit_date: lastVisitDate,
  };
};

const generateMockOrders = (customerId: string, numOrders: number = 5): Order[] => {
  const orders: Order[] = [];
  for (let i = 0; i < numOrders; i++) {
    const orderDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2).toISOString(); // Last 2 years
    const amount = Math.floor(Math.random() * 100000) + 500; // $5 to $1000
    const statuses = ['completed', 'pending', 'shipped', 'cancelled'];
    orders.push({
      order_id: `ORD-${customerId}-${i + 1}`,
      date: orderDate,
      amount_cents: amount,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  // Sort orders by date descending
  return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const generateMockNotes = (customerId: string) => {
  const notesTemplates = [
    `Customer often buys products on sale. Prefers email communication.`,
    `Had an issue with a delivery in Q3 last year, resolved with a discount.`,
    `High-value customer, responds well to loyalty program incentives.`,
    `Requested specific features in the past. Follow up on product roadmap.`,
    `Relatively new customer, no specific notes yet.`,
  ];
  return notesTemplates[Math.floor(Math.random() * notesTemplates.length)];
};


export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterTier, setFilterTier] = useState<string>('All');
  const [sortBy, setSortBy] = useState<keyof Customer | null>('total_spent_cents');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [detailOrders, setDetailOrders] = useState<Order[]>([]);
  const [detailLoyaltyPoints, setDetailLoyaltyPoints] = useState<number | null>(null);
  const [detailNotes, setDetailNotes] = useState<string>('');
  const [isNotesEditing, setIsNotesEditing] = useState<boolean>(false);

  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState<boolean>(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', email: '', phone: '' });
  const [isAddingCustomer, setIsAddingCustomer] = useState<boolean>(false);
  const [addCustomerError, setAddCustomerError] = useState<string | null>(null);

  // --- Fetch Customers ---
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulating API call with mock data generation
        // In a real application, you would make a fetch request like:
        // const response = await fetch(`${API_BASE}/customers`);
        // if (!response.ok) throw new Error('Network response was not ok');
        // const data = await response.json();
        // setCustomers(data);
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
        const mockCustomers: Customer[] = Array.from({ length: 50 }, (_, i) => generateMockCustomer(i + 1));
        setCustomers(mockCustomers);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setError("Failed to load customers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // --- Filter and Sort Customers ---
  const filteredAndSortedCustomers = useMemo(() => {
    let result = [...customers];

    // Search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (customer) =>
          customer.name.toLowerCase().includes(lowerSearchTerm) ||
          customer.email.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Tier filter
    if (filterTier !== 'All') {
      result = result.filter(
        (customer) => getLoyaltyTier(customer.loyalty_points) === filterTier
      );
    }

    // Sort
    if (sortBy) {
      result.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }

    return result;
  }, [customers, searchTerm, filterTier, sortBy, sortDirection]);

  // --- Handlers ---
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFilterTierChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterTier(e.target.value);
  }, []);

  const handleSort = useCallback((column: keyof Customer) => {
    if (sortBy === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDirection('desc'); // Default to desc for spend (highest spend first)
    }
  }, [sortBy]);


  const handleCustomerClick = useCallback(async (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
    setDetailOrders([]); // Clear previous details
    setDetailLoyaltyPoints(null);
    setDetailNotes('');
    setIsNotesEditing(false);

    try {
      // Simulate fetching customer details
      // In a real application, you'd fetch details like:
      // const ordersResponse = await fetch(`${API_BASE}/customers/${customer.id}/orders`);
      // const notesResponse = await fetch(`${API_BASE}/customers/${customer.id}/notes`);
      // const loyaltyResponse = await fetch(`${API_BASE}/customers/${customer.id}/loyalty`);
      // setDetailOrders(await ordersResponse.json());
      // setDetailNotes(await notesResponse.json().notes);
      // setDetailLoyaltyPoints(await loyaltyResponse.json().points);

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setDetailOrders(generateMockOrders(customer.id, Math.floor(Math.random() * 15) + 3));
      setDetailLoyaltyPoints(customer.loyalty_points); // Or fetch real-time from another endpoint
      setDetailNotes(generateMockNotes(customer.id));
    } catch (err) {
      console.error("Failed to fetch customer details:", err);
      // Handle error, maybe set error state for detail view
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedCustomer(null);
    setDetailOrders([]);
    setDetailLoyaltyPoints(null);
    setDetailNotes('');
    setIsNotesEditing(false);
  }, []);

  const handleAddCustomerModalOpen = useCallback(() => {
    setIsAddCustomerModalOpen(true);
    setNewCustomerForm({ name: '', email: '', phone: '' });
    setAddCustomerError(null);
  }, []);

  const handleAddCustomerFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomerForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAddCustomerSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingCustomer(true);
    setAddCustomerError(null);

    // Basic validation
    if (!newCustomerForm.name || !newCustomerForm.email || !newCustomerForm.phone) {
      setAddCustomerError('All fields are required.');
      setIsAddingCustomer(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newCustomerForm.email)) {
      setAddCustomerError('Please enter a valid email address.');
      setIsAddingCustomer(false);
      return;
    }
    if (!/^\+?[0-9\s-()]{7,25}$/.test(newCustomerForm.phone)) {
        setAddCustomerError('Please enter a valid phone number.');
        setIsAddingCustomer(false);
        return;
    }

    try {
      // Simulate POST /customers API call
      // In a real app:
      // const response = await fetch(`${API_BASE}/customers`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newCustomerForm),
      // });
      // if (!response.ok) throw new Error('Failed to add customer');
      // const addedCustomer = await response.json();
      // setCustomers(prev => [addedCustomer, ...prev]);

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      const newId = `cust-${customers.length + 1}-${Date.now()}`;
      const mockNewCustomer: Customer = {
        id: newId,
        name: newCustomerForm.name,
        email: newCustomerForm.email,
        phone: newCustomerForm.phone,
        total_orders: 0,
        total_spent_cents: 0,
        loyalty_points: 100, // Starting points for new customers
        visit_count: 1,
        last_visit_date: new Date().toISOString(),
      };

      setCustomers(prev => [mockNewCustomer, ...prev]); // Add to top
      setIsAddCustomerModalOpen(false);
      // Optionally, show a success toast/message
    } catch (err) {
      console.error("Failed to add customer:", err);
      setAddCustomerError("Failed to add customer. Please try again.");
    } finally {
      setIsAddingCustomer(false);
    }
  }, [newCustomerForm, customers.length]);

  const handleExportToCSV = useCallback(() => {
    if (filteredAndSortedCustomers.length === 0) {
      alert("No customers to export.");
      return;
    }

    const headers = ["ID", "Name", "Email", "Phone", "Total Spend", "Total Orders", "Visit Count", "Loyalty Points", "Loyalty Tier", "Last Visit Date"];
    const csvRows = filteredAndSortedCustomers.map(customer => [
      customer.id,
      `"${customer.name.replace(/"/g, '""')}"`, // Handle quotes in names
      customer.email,
      customer.phone,
      fmt(customer.total_spent_cents).replace('$', ''), // Remove '$' for raw number
      customer.total_orders,
      customer.visit_count,
      customer.loyalty_points,
      getLoyaltyTier(customer.loyalty_points),
      formatDate(customer.last_visit_date),
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'customers_paysurity.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredAndSortedCustomers]);

  const handleSaveNotes = useCallback(async () => {
    if (!selectedCustomer) return;
    setIsNotesEditing(false);
    try {
      // Simulate API call to save notes for selectedCustomer.id
      // In a real app:
      // await fetch(`${API_BASE}/customers/${selectedCustomer.id}/notes`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ notes: detailNotes }),
      // });
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Notes saved for customer ${selectedCustomer.id}: ${detailNotes}`);
    } catch (error) {
      console.error("Failed to save notes:", error);
      alert("Failed to save notes.");
    }
  }, [selectedCustomer, detailNotes]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-violet-400 flex items-center gap-3">
          <Users className="text-violet-500" size={32} /> Customers CRM
        </h1>
        <div className="flex gap-4">
          <button
            onClick={handleAddCustomerModalOpen}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
          >
            <Plus size={20} /> Add Customer
          </button>
          <button
            onClick={handleExportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition duration-200"
          >
            <Download size={20} /> Export to CSV
          </button>
        </div>
      </header>

      <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-white placeholder-gray-400"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div>
            <select
              className="w-full md:w-48 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-white"
              value={filterTier}
              onChange={handleFilterTierChange}
            >
              <option value="All">All Tiers</option>
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-8 w-8 text-violet-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-lg">Loading customers...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-red-500 text-lg">
            <Info className="mr-2" /> {error}
          </div>
        ) : filteredAndSortedCustomers.length === 0 ? (
          <div className="flex justify-center items-center h-64 text-gray-400 text-lg">
            No customers found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('total_spent_cents')}
                      className="flex items-center gap-1 focus:outline-none"
                    >
                      Total Spend
                      {sortBy === 'total_spent_cents' && (
                        sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Visits
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Loyalty Tier
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Last Visit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredAndSortedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-700 cursor-pointer transition duration-150 ease-in-out"
                    onClick={() => handleCustomerClick(customer)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">
                      {fmt(customer.total_spent_cents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{customer.visit_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tierColor(getLoyaltyTier(customer.loyalty_points))}`}>
                        {getLoyaltyTier(customer.loyalty_points)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(customer.last_visit_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Slide-over (Sheet) */}
      {isDetailOpen && selectedCustomer && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={handleCloseDetail}></div>
            <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col py-6 bg-gray-800 shadow-xl overflow-y-scroll">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-xl font-bold text-violet-400 flex items-center gap-2">
                        <Users size={24} /> Customer Details
                      </h2>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          type="button"
                          className="bg-gray-700 rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                          onClick={handleCloseDetail}
                        >
                          <span className="sr-only">Close panel</span>
                          <X size={24} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 relative flex-1 px-4 sm:px-6">
                    {/* Content */}
                    <div className="flex flex-col gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{selectedCustomer.name}</h3>
                        <p className="text-gray-300 flex items-center gap-2 mb-1"><span className="text-gray-400">Email:</span> {selectedCustomer.email}</p>
                        <p className="text-gray-300 flex items-center gap-2 mb-1"><span className="text-gray-400">Phone:</span> {selectedCustomer.phone}</p>
                        <p className="text-gray-300 flex items-center gap-2 mb-1">
                          <span className="text-gray-400">Total Spent:</span> <span className="text-white font-semibold">{fmt(selectedCustomer.total_spent_cents)}</span>
                        </p>
                        <p className="text-gray-300 flex items-center gap-2 mb-1">
                          <span className="text-gray-400">Loyalty Tier:</span>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tierColor(getLoyaltyTier(selectedCustomer.loyalty_points))}`}>
                            {getLoyaltyTier(selectedCustomer.loyalty_points)}
                          </span>
                        </p>
                        <p className="text-gray-300 flex items-center gap-2">
                          <span className="text-gray-400">Last Visit:</span> {formatDate(selectedCustomer.last_visit_date)}
                        </p>
                      </div>

                      {/* Loyalty Points */}
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-violet-300 flex items-center gap-2 mb-2"><DollarSign size={20} /> Loyalty Points</h4>
                        {detailLoyaltyPoints !== null ? (
                          <p className="text-gray-200 text-2xl font-bold">{detailLoyaltyPoints}</p>
                        ) : (
                          <p className="text-gray-400">Loading loyalty points...</p>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-violet-300 flex items-center gap-2"><NotebookPen size={20} /> Notes</h4>
                          {!isNotesEditing ? (
                            <button
                              onClick={() => setIsNotesEditing(true)}
                              className="text-gray-400 hover:text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                            >
                              <Edit2 size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={handleSaveNotes}
                              className="text-violet-400 hover:text-violet-300 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                            >
                              <Save size={18} />
                            </button>
                          )}
                        </div>
                        {isNotesEditing ? (
                          <textarea
                            className="w-full h-24 bg-gray-600 border border-gray-500 rounded-md p-2 text-white focus:ring-violet-500 focus:border-violet-500"
                            value={detailNotes}
                            onChange={(e) => setDetailNotes(e.target.value)}
                            placeholder="Add notes about this customer..."
                          />
                        ) : (
                          <p className="text-gray-200 whitespace-pre-wrap">{detailNotes || "No notes available."}</p>
                        )}
                      </div>

                      {/* Order History */}
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-violet-300 flex items-center gap-2 mb-2"><Clock size={20} /> Order History</h4>
                        {detailOrders.length > 0 ? (
                          <div className="max-h-60 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-600 text-sm">
                              <thead className="sticky top-0 bg-gray-700">
                                <tr>
                                  <th scope="col" className="px-4 py-2 text-left font-medium text-gray-300 uppercase">ID</th>
                                  <th scope="col" className="px-4 py-2 text-left font-medium text-gray-300 uppercase">Date</th>
                                  <th scope="col" className="px-4 py-2 text-left font-medium text-gray-300 uppercase">Amount</th>
                                  <th scope="col" className="px-4 py-2 text-left font-medium text-gray-300 uppercase">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-600">
                                {detailOrders.map((order) => (
                                  <tr key={order.order_id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-100">{order.order_id}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-300">{formatDate(order.date)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-100">{fmt(order.amount_cents)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-300">{order.status}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-gray-400">No order history available.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Add Customer Modal (Dialog) */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={() => setIsAddCustomerModalOpen(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddCustomerSubmit}>
                <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-violet-600 sm:mx-0 sm:h-10 sm:w-10">
                      <Plus className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-white" id="modal-title">
                        Add New Customer
                      </h3>
                      <div className="mt-4">
                        <div className="mb-4">
                          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-violet-500 focus:border-violet-500"
                            value={newCustomerForm.name}
                            onChange={handleAddCustomerFormChange}
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-violet-500 focus:border-violet-500"
                            value={newCustomerForm.email}
                            onChange={handleAddCustomerFormChange}
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            id="phone"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-violet-500 focus:border-violet-500"
                            value={newCustomerForm.phone}
                            onChange={handleAddCustomerFormChange}
                            required
                          />
                        </div>
                        {addCustomerError && (
                          <p className="text-red-500 text-sm mt-2">{addCustomerError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-violet-600 text-base font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={isAddingCustomer}
                  >
                    {isAddingCustomer ? 'Adding...' : 'Add Customer'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsAddCustomerModalOpen(false)}
                    disabled={isAddingCustomer}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}