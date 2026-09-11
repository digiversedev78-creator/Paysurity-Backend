import React from 'react';

// Define types for the data we expect from the APIs
interface StoreStats {
  todaySales: number;
  transactionCount: number;
  ebtSplitAmount: number;
}

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  reorderPoint: number;
  imageUrl?: string; // Optional image URL
  price: number; // Assuming price might be useful for top sellers
  salesCount: number; // Assuming sales count for top sellers
}

// Function to fetch store statistics
async function getStoreStats(): Promise<StoreStats> {
  // In a production environment, you would fetch data from your backend API:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/store/stats`, {
  //   headers: {
  //     // Include authorization headers if necessary
  //     // 'Authorization': `Bearer ${token}`
  //   },
  //   next: { revalidate: 60 } // Revalidate data every 60 seconds
  // });
  //
  // if (!res.ok) {
  //   throw new Error(`Failed to fetch store stats: ${res.statusText}`);
  // }
  // return res.json();

  // Mock data for demonstration purposes
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return {
    todaySales: 2153.75,
    transactionCount: 112,
    ebtSplitAmount: 489.20,
  };
}

// Function to fetch inventory data, including low stock and top selling items
// In a real application, top selling items might come from a separate sales analytics endpoint.
// For this task, we'll simulate fetching a list of all inventory items and processing them.
async function getInventoryData(): Promise<{ lowStock: InventoryItem[]; topSelling: InventoryItem[] }> {
  // In a production environment, you would fetch data from your backend API:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inventory/items`, { // Or /inventory/low-stock if it returns all relevant data
  //   headers: { /* Authorization headers */ },
  //   next: { revalidate: 300 } // Revalidate data every 5 minutes
  // });
  //
  // if (!res.ok) {
  //   throw new Error(`Failed to fetch inventory data: ${res.statusText}`);
  // }
  // const allItems: InventoryItem[] = await res.json();
  //
  // const lowStock = allItems.filter(item => item.currentStock < item.reorderPoint);
  // const topSelling = allItems.sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);
  //
  // return { lowStock, topSelling };

  // Mock data for demonstration purposes
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay

  const mockInventory: InventoryItem[] = [
    { id: 'item-001', name: 'Organic Bananas', currentStock: 5, reorderPoint: 10, imageUrl: '/images/mock/bananas.jpg', price: 0.79, salesCount: 120 },
    { id: 'item-002', name: 'Whole Milk (Gallon)', currentStock: 2, reorderPoint: 5, imageUrl: '/images/mock/milk.jpg', price: 3.99, salesCount: 150 },
    { id: 'item-003', name: 'Artisan Sourdough Bread', currentStock: 15, reorderPoint: 20, imageUrl: '/images/mock/bread.jpg', price: 4.50, salesCount: 90 },
    { id: 'item-004', name: 'Fresh Atlantic Salmon', currentStock: 3, reorderPoint: 5, imageUrl: '/images/mock/salmon.jpg', price: 12.99, salesCount: 110 },
    { id: 'item-005', name: 'Avocados (Bag)', currentStock: 20, reorderPoint: 15, imageUrl: '/images/mock/avocado.jpg', price: 1.50, salesCount: 200 },
    { id: 'item-006', name: 'Sparkling Water (6-pack)', currentStock: 8, reorderPoint: 10, imageUrl: '/images/mock/sparkling-water.jpg', price: 5.99, salesCount: 80 },
    { id: 'item-007', name: 'Ground Coffee (Dark Roast)', currentStock: 7, reorderPoint: 10, imageUrl: '/images/mock/coffee.jpg', price: 9.99, salesCount: 130 },
    { id: 'item-008', name: 'Organic Eggs (Dozen)', currentStock: 1, reorderPoint: 6, imageUrl: '/images/mock/eggs.jpg', price: 4.29, salesCount: 70 },
    { id: 'item-009', name: 'Greek Yogurt (Plain)', currentStock: 25, reorderPoint: 15, imageUrl: '/images/mock/yogurt.jpg', price: 2.50, salesCount: 180 },
    { id: 'item-010', name: 'Fresh Strawberries (1lb)', currentStock: 10, reorderPoint: 12, imageUrl: '/images/mock/strawberries.jpg', price: 3.99, salesCount: 210 },
  ];

  const lowStock = mockInventory.filter(item => item.currentStock < item.reorderPoint);
  const topSelling = mockInventory.sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);

  return { lowStock, topSelling };
}

export default async function GroceryDashboardPage() {
  let stats: StoreStats | null = null;
  let inventoryData: { lowStock: InventoryItem[]; topSelling: InventoryItem[] } | null = null;
  let error: string | null = null;

  try {
    // Fetch data in parallel to improve load time
    const [fetchedStats, fetchedInventoryData] = await Promise.all([
      getStoreStats(),
      getInventoryData(),
    ]);
    stats = fetchedStats;
    inventoryData = fetchedInventoryData;
  } catch (err: any) {
    console.error('Failed to load dashboard data:', err);
    error = err.message || 'An unexpected error occurred while fetching dashboard data.';
  }

  // Display error message if data fetching failed
  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg shadow-md m-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Loading Error</h1>
        <p>We could not load your GrocerEase dashboard:</p>
        <p className="font-mono text-sm mt-2">{error}</p>
        <p className="mt-4">Please check your network connection and try refreshing the page. If the issue persists, contact support.</p>
      </div>
    );
  }

  // Fallback for an unlikely scenario where data is null but no error was explicitly caught
  if (!stats || !inventoryData) {
    return (
      <div className="p-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p className="text-xl font-semibold">Loading GrocerEase Dashboard...</p>
          <p className="mt-2">Please wait a moment while we retrieve your latest data.</p>
          {/* A simple spinner could be added here */}
        </div>
      </div>
    );
  }

  const { lowStock, topSelling } = inventoryData;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">GrocerEase Dashboard</h1>

      {/* Sales & Transactions Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Sales Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between border border-gray-100 transition-transform hover:scale-105 duration-200">
          <div>
            <p className="text-sm font-medium text-gray-500">Today's Sales</p>
            <p className="text-4xl font-extrabold text-green-600 mt-1">${stats.todaySales.toFixed(2)}</p>
          </div>
          <p className="text-xs text-gray-400 mt-4">As of {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        {/* Transaction Count Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between border border-gray-100 transition-transform hover:scale-105 duration-200">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Transactions</p>
            <p className="text-4xl font-extrabold text-blue-600 mt-1">{stats.transactionCount}</p>
          </div>
          <p className="text-xs text-gray-400 mt-4">Processed today</p>
        </div>

        {/* EBT Split Amount Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between border border-gray-100 transition-transform hover:scale-105 duration-200">
          <div>
            <p className="text-sm font-medium text-gray-500">EBT Sales Today</p>
            <p className="text-4xl font-extrabold text-purple-600 mt-1">${stats.ebtSplitAmount.toFixed(2)}</p>
          </div>
          <p className="text-xs text-gray-400 mt-4">Portion of today's total sales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Selling Items Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top 5 Selling Items</h2>
          {topSelling.length === 0 ? (
            <p className="text-gray-500 italic">No sales data available to determine top sellers yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {topSelling.map((item, index) => (
                <li key={item.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover mr-4" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{index + 1}. {item.name}</p>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} / unit</p>
                    </div>
                  </div>
                  <span className="text-md text-gray-700 font-bold">{item.salesCount} units</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Low Stock Alerts Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Low Stock Alerts</h2>
          {lowStock.length === 0 ? (
            <p className="text-gray-500 italic">All items are currently sufficiently stocked. Good job!</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {lowStock.map(item => (
                <li key={item.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover mr-4" />
                    )}
                    <div>
                      <p className="font-medium text-red-600">{item.name}</p>
                      <p className="text-sm text-gray-500">Reorder point: {item.reorderPoint}</p>
                    </div>
                  </div>
                  <span className="text-red-500 font-extrabold text-lg">Stock: {item.currentStock}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}