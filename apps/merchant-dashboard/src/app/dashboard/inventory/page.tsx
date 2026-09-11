'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// API Base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Define the Inventory Item type based on expected API response
interface InventoryItem {
  id: string; // Unique identifier, serves as SKU/Barcode
  name: string;
  quantity: number; // Current quantity on hand
  unit: string;
  reorder_point: number; // The point at which to reorder
  cost_in_cents: number; // Cost in cents
  price_in_cents: number; // Selling price in cents
  supplier?: string; // Optional
  last_order?: string; // Optional, ISO date string
  category?: string; // Optional
}

// New type for adding an item (without the ID, as it's typically backend-generated)
interface NewInventoryItem {
  name: string;
  quantity: number;
  unit: string;
  reorder_point: number;
  cost_in_cents: number;
  price_in_cents: number; // Selling price in cents
  supplier?: string;
  category?: string;
}

// Fallback/Demo Data for when API fails
const FALLBACK_INVENTORY: InventoryItem[] = [
  { id: 'FALLBACK-001', name: 'Ground Beef (80/20)', category: 'Proteins', unit: 'lb', quantity: 45, reorder_point: 50, cost_in_cents: 599, price_in_cents: 999, supplier: 'US Foods', last_order: '2026-03-12' },
  { id: 'FALLBACK-002', name: 'Chicken Breast', category: 'Proteins', unit: 'lb', quantity: 32, reorder_point: 30, cost_in_cents: 449, price_in_cents: 799, supplier: 'Sysco', last_order: '2026-03-10' },
  { id: 'FALLBACK-003', name: 'Romaine Lettuce', category: 'Produce', unit: 'case', quantity: 8, reorder_point: 10, cost_in_cents: 2499, price_in_cents: 3999, supplier: 'Local Farm', last_order: '2026-03-13' },
  { id: 'FALLBACK-004', name: 'Brioche Buns', category: 'Bakery', unit: 'dozen', quantity: 15, reorder_point: 12, cost_in_cents: 899, price_in_cents: 1499, supplier: 'Premium Bakery', last_order: '2026-03-11' },
  { id: 'FALLBACK-005', name: 'Truffle Oil', category: 'Oils & Sauces', unit: 'bottle', quantity: 3, reorder_point: 5, cost_in_cents: 1299, price_in_cents: 2499, supplier: 'Specialty Foods', last_order: '2026-03-08' },
  { id: 'FALLBACK-006', name: 'French Fries (frozen)', category: 'Frozen', unit: 'case', quantity: 22, reorder_point: 15, cost_in_cents: 1899, price_in_cents: 2999, supplier: 'US Foods', last_order: '2026-03-09' },
  { id: 'FALLBACK-007', name: 'Cheddar Cheese', category: 'Dairy', unit: 'lb', quantity: 12, reorder_point: 20, cost_in_cents: 649, price_in_cents: 1099, supplier: 'Sysco', last_order: '2026-03-12' },
];

const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number | null>(null);
  const [showAddItemForm, setShowAddItemForm] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<NewInventoryItem>({
    name: '',
    quantity: 0,
    unit: '',
    reorder_point: 0,
    cost_in_cents: 0,
    price_in_cents: 0,
    supplier: '',
    category: '',
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' | ''; } | null>(null);

  // Memoize categories for the filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = new Set(inventoryItems.map(item => item.category).filter(Boolean) as string[]);
    return ['', ...Array.from(uniqueCategories).sort()]; // Add an empty option for "All"
  }, [inventoryItems]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: InventoryItem[] = await response.json();
      setInventoryItems(data);
    } catch (err: any) {
      console.error("Failed to fetch inventory:", err);
      setError("Failed to load inventory. Displaying fallback data.");
      setInventoryItems(FALLBACK_INVENTORY); // Use fallback data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Apply search and category filters
  const filteredInventoryItems = useMemo(() => {
    let filtered = inventoryItems;

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.id.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.supplier?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.category?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    return filtered;
  }, [inventoryItems, searchTerm, selectedCategory]);

  const showTemporaryToast = (message: string, type: 'success' | 'error') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000); // Hide toast after 3 seconds
  };

  // Handler for adding a new item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name === '' || newItem.quantity < 0 || newItem.unit === '' || newItem.cost_in_cents < 0 || newItem.price_in_cents < 0) {
      showTemporaryToast('Please fill all required fields correctly and ensure numbers are non-negative.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        throw new Error(`Failed to add item: ${response.statusText}`);
      }

      const addedItem: InventoryItem = await response.json();
      setInventoryItems(prevItems => [...prevItems, addedItem]);
      setShowAddItemForm(false);
      setNewItem({
        name: '', quantity: 0, unit: '', reorder_point: 0, cost_in_cents: 0, price_in_cents: 0, supplier: '', category: '',
      });
      showTemporaryToast('Item added successfully!', 'success');
    } catch (err: any) {
      console.error("Error adding item:", err);
      showTemporaryToast(`Error adding item: ${err.message}`, 'error');
    }
  };

  // Handler for adjusting stock with +/- buttons
  const handleAdjustQuantity = useCallback(async (id: string, delta: number) => {
    const itemToUpdate = inventoryItems.find(item => item.id === id);
    if (!itemToUpdate) return;

    const newQuantity = Math.max(0, itemToUpdate.quantity + delta); // Ensure quantity doesn't go below 0

    // Optimistically update the UI
    setInventoryItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error(`Failed to adjust quantity: ${response.statusText}`);
      }
      showTemporaryToast('Quantity adjusted successfully!', 'success');
    } catch (err: any) {
      console.error("Error adjusting quantity:", err);
      showTemporaryToast(`Error adjusting quantity: ${err.message}`, 'error');
      // Revert optimistic update on error
      setInventoryItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity: itemToUpdate.quantity } : item
        )
      );
    }
  }, [inventoryItems]);


  // Handlers for inline quantity editing
  const handleInlineQuantityChange = (id: string, newQtyString: string) => {
    const newQty = parseInt(newQtyString, 10);
    // Allow empty string for temporary user input, but only update state if valid number
    if (newQtyString === '' || (!isNaN(newQty) && newQty >= 0)) {
      setEditingItemId(id);
      setEditingQuantity(isNaN(newQty) ? null : newQty); // Store null if input is not a number
    }
  };

  const handleSaveInlineQuantity = async (id: string) => {
    if (editingItemId === id && editingQuantity !== null) {
      // Find the original item to revert if necessary
      const originalItem = inventoryItems.find(item => item.id === id);
      if (!originalItem || originalItem.quantity === editingQuantity) {
        setEditingItemId(null);
        setEditingQuantity(null);
        return; // No change or item not found
      }

      // Optimistically update quantity
      setInventoryItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity: editingQuantity } : item
        )
      );

      try {
        const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: editingQuantity }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save quantity: ${response.statusText}`);
        }
        showTemporaryToast('Quantity updated successfully!', 'success');
      } catch (err: any) {
        console.error("Error saving quantity:", err);
        showTemporaryToast(`Error saving quantity: ${err.message}`, 'error');
        // Revert optimistic update on error
        setInventoryItems(prevItems =>
          prevItems.map(item =>
            item.id === id ? { ...item, quantity: originalItem.quantity } : item
          )
        );
      } finally {
        setEditingItemId(null);
        setEditingQuantity(null);
      }
    } else if (editingItemId === id && editingQuantity === null) {
      // If user clears the input, reset to original value and close editor
      setEditingItemId(null);
      setEditingQuantity(null);
    }
  };

  const handleCancelInlineQuantity = () => {
    setEditingItemId(null);
    setEditingQuantity(null);
    // If there were local changes, they will be discarded by closing the editor
    // (since we only update the main state on successful save or if directly using +/- buttons)
  };


  // Handler for bulk import CSV
  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      showTemporaryToast('Please upload a valid CSV file.', 'error');
      e.target.value = ''; // Clear file input
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', file); // Ensure 'csvFile' matches backend's expected field name

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/inventory/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`CSV import failed: ${errorData.message || response.statusText}`);
      }

      // Assuming the backend returns the updated inventory list or a success message
      const result = await response.json();
      if (Array.isArray(result)) {
        setInventoryItems(result); // If it returns the full list
      } else {
        fetchInventory(); // Otherwise, re-fetch to get the latest data
      }
      showTemporaryToast('CSV imported successfully!', 'success');
    } catch (err: any) {
      console.error("Error importing CSV:", err);
      showTemporaryToast(`Error importing CSV: ${err.message}`, 'error');
    } finally {
      setLoading(false);
      // Clear the file input value
      e.target.value = '';
    }
  };

  // Handler for exporting to CSV
  const handleExportCSV = useCallback(() => {
    if (filteredInventoryItems.length === 0) {
      showTemporaryToast('No data to export.', 'error');
      return;
    }

    const headers = [
      'ID', 'Name', 'Category', 'Unit', 'Quantity', 'Reorder Point', 'Cost (cents)', 'Price (cents)', 'Supplier', 'Last Order'
    ];
    const csvRows = filteredInventoryItems.map(item =>
      [
        item.id,
        item.name,
        item.category || '',
        item.unit,
        item.quantity,
        item.reorder_point,
        item.cost_in_cents,
        item.price_in_cents,
        item.supplier || '',
        item.last_order || '',
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    );

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...csvRows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'paysurity_inventory_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showTemporaryToast('Inventory exported successfully!', 'success');
    } else {
      showTemporaryToast('Your browser does not support automatic CSV downloads.', 'error');
    }
  }, [filteredInventoryItems]);


  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Inventory Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {showToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${showToast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {showToast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search items by name, ID, category..."
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 flex-grow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 flex-shrink-0 w-full md:w-auto"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat || 'Uncategorized'}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
          <button
            onClick={() => setShowAddItemForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full md:w-auto"
          >
            + Add New Item
          </button>
          <label htmlFor="csv-upload" className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 cursor-pointer text-center w-full md:w-auto">
            Bulk Import CSV
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleBulkImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 w-full md:w-auto"
          >
            Export to CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Loading inventory...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode / PLU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty on Hand ({'Unit'})</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Point</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventoryItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No inventory items found matching your criteria.</td>
                </tr>
              ) : (
                filteredInventoryItems.map((item) => (
                  <tr key={item.id} className={`${item.quantity <= item.reorder_point ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.cost_in_cents)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.price_in_cents)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAdjustQuantity(item.id, -1)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                          disabled={item.quantity <= 0}
                        >
                          -
                        </button>
                        {editingItemId === item.id ? (
                          <input
                            type="number"
                            value={editingQuantity !== null ? editingQuantity : ''} // Show empty string if null, allowing user to clear
                            onChange={(e) => handleInlineQuantityChange(item.id, e.target.value)}
                            onBlur={() => handleSaveInlineQuantity(item.id)} // Save on blur
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur(); // Trigger onBlur to save
                              }
                              if (e.key === 'Escape') handleCancelInlineQuantity();
                            }}
                            className="w-16 p-1 border border-blue-300 rounded-md text-center"
                            autoFocus
                          />
                        ) : (
                          <span
                            className={`cursor-pointer ${item.quantity <= item.reorder_point ? 'text-red-600 font-semibold' : ''}`}
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditingQuantity(item.quantity);
                            }}
                          >
                            {item.quantity} {item.unit}
                          </span>
                        )}
                        <button
                          onClick={() => handleAdjustQuantity(item.id, 1)}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`${item.quantity <= item.reorder_point ? 'text-red-600 font-semibold' : ''}`}>
                        {item.reorder_point}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* More actions like Edit Item (full modal), Delete item could go here */}
                        {/* Example: <button className="text-indigo-600 hover:text-indigo-900 ml-2">Edit</button> */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddItemForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Inventory Item</h2>
            <form onSubmit={handleAddItem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name</label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    id="category"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={newItem.category || ''}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit (e.g., lb, case, bottle)</label>
                  <input
                    type="text"
                    id="unit"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity on Hand</label>
                  <input
                    type="number"
                    id="quantity"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value, 10) || 0 })}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="reorder_point" className="block text-sm font-medium text-gray-700">Reorder Point</label>
                  <input
                    type="number"
                    id="reorder_point"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={newItem.reorder_point}
                    onChange={(e) => setNewItem({ ...newItem, reorder_point: parseInt(e.target.value, 10) || 0 })}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cost_in_cents" className="block text-sm font-medium text-gray-700">Cost (cents)</label>
                  <input
                    type="number"
                    id="cost_in_cents"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={newItem.cost_in_cents}
                    onChange={(e) => setNewItem({ ...newItem, cost_in_cents: parseInt(e.target.value, 10) || 0 })}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="price_in_cents" className="block text-sm font-medium text-gray-700">Price (cents)</label>
                  <input
                    type="number"
                    id="price_in_cents"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={newItem.price_in_cents}
                    onChange={(e) => setNewItem({ ...newItem, price_in_cents: parseInt(e.target.value, 10) || 0 })}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Supplier (Optional)</label>
                  <input
                    type="text"
                    id="supplier"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={newItem.supplier || ''}
                    onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddItemForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}