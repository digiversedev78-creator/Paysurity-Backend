'use client'; // This is a client component

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { ApiClient } from '../../../lib/api-client';

// Define a simple Product type
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  rating: number; // e.g., 1-5
}

// Helper for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const ProductsPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams(); // To get the dynamic slug from the URL

  // Ensure storeSlug is always a string, handling potential array for dynamic routes
  const storeSlug = Array.isArray(params.slug) ? params.slug[0] : (params.slug || 'default-store');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters and search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Debounce search input

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>(''); // e.g., price_asc, price_desc, name_asc, name_desc, rating_desc

  // Sample categories - in a real app, these would typically be fetched from an API
  const availableCategories = useMemo(() => ['Electronics', 'Books', 'Clothing', 'Home Goods', 'Food'], []);

  // Sync state from URL on initial load
  useEffect(() => {
    // Note: searchParams.getAll returns string[], searchParams.get returns string | null
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCategories(searchParams.getAll('category') || []);
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSortBy(searchParams.get('sortBy') || '');
  }, [searchParams]); // Rerun when searchParams object changes

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    if (debouncedSearchQuery) query.set('q', debouncedSearchQuery);
    selectedCategories.forEach(cat => query.append('category', cat));
    if (minPrice) query.set('minPrice', minPrice);
    if (maxPrice) query.set('maxPrice', maxPrice);
    if (sortBy) query.set('sortBy', sortBy);

    try {
      // Nerve Center Wiring: Use centralized ApiClient
      const data = await ApiClient.get<Product[]>(`/inventory?${query.toString()}`);
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, selectedCategories, minPrice, maxPrice, sortBy]);

  const handleUpdatePrice = async (productId: string, newPrice: number) => {
    try {
      await ApiClient.patch(`/inventory/${productId}/price`, { price: newPrice, type: 'RESTAURANT' });
      alert('Price updated successfully! Guardrail REQ-OPS-004 triggered.');
      fetchProducts();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      await ApiClient.patch(`/inventory/${productId}/status`, { isActive: !currentStatus, type: 'RESTAURANT' });
      fetchProducts();
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  // Effect to trigger product fetching and update URL
  useEffect(() => {
    // Only fetch if storeSlug is available
    if (storeSlug) {
        fetchProducts();

        // Update URL search parameters
        const currentParams = new URLSearchParams();
        
        // Use the non-debounced search query for URL to reflect immediate input
        if (searchQuery) currentParams.set('q', searchQuery);
        
        // Set categories
        selectedCategories.forEach(cat => currentParams.append('category', cat));

        // Set price range
        if (minPrice) currentParams.set('minPrice', minPrice);
        if (maxPrice) currentParams.set('maxPrice', maxPrice);

        // Set sort by
        if (sortBy) currentParams.set('sortBy', sortBy);

        const newQueryString = currentParams.toString();
        // Construct the full path to ensure it replaces existing params
        const newPath = `${window.location.pathname}?${newQueryString}`;
        
        // Use router.replace to avoid adding too many entries to history
        if (`${window.location.pathname}${window.location.search}` !== newPath) {
          router.replace(newPath);
        }
    }
  }, [
    storeSlug,
    debouncedSearchQuery, // Use debounced query for fetching
    selectedCategories,
    minPrice,
    maxPrice,
    sortBy,
    searchQuery, // Use immediate query for URL update
    router,
    fetchProducts
  ]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleMinPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinPrice(value);
  }, []);

  const handleMaxPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxPrice(value);
  }, []);

  const handleSortByChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  }, []);

  const handleAddToCart = useCallback((productId: string) => {
    // Placeholder for add to cart logic
    console.log(`Added product ${productId} to cart.`);
    alert(`Product ${productId} added to cart! (This is a placeholder action)`);
  }, []);

  if (loading && products.length === 0) {
    return <div className="p-4 text-center text-lg font-medium text-gray-700">Loading products...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600 text-lg font-medium">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row p-4 space-x-0 md:space-x-6 space-y-6 md:space-y-0 min-h-screen bg-gray-100">
      {/* Sidebar for filters */}
      <aside className="w-full md:w-1/4 bg-white p-5 rounded-xl shadow-lg h-fit sticky top-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Filters</h2>

        {/* Search Bar */}
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Products
          </label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search products..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Categories</h3>
          <div className="space-y-2">
            {availableCategories.map(category => (
              <div key={category} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all duration-200 cursor-pointer"
                />
                <label htmlFor={`category-${category}`} className="ml-2 text-base text-gray-900 cursor-pointer">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Price Range</h3>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={minPrice}
              onChange={handleMinPriceChange}
              placeholder="Min"
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              min="0"
            />
            <span className="text-gray-500 text-lg">-</span>
            <input
              type="number"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              placeholder="Max"
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              min="0"
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="mb-6">
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={handleSortByChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer"
          >
            <option value="">None</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A-Z</option>
            <option value="name_desc">Name: Z-A</option>
            <option value="rating_desc">Rating: High to Low</option>
          </select>
        </div>
      </aside>

      {/* Main content area for products */}
      <main className="flex-1">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
          Product Catalog for <span className="text-blue-600 capitalize">{storeSlug.replace(/-/g, ' ')}</span>
        </h1>

        {products.length === 0 && !loading && (
          <div className="text-center text-gray-600 text-xl p-10 bg-white rounded-xl shadow-lg">
            No products found matching your criteria.
            <p className="mt-4 text-lg">Try adjusting your filters or search query.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
              <div
                className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400 text-sm font-medium relative"
                style={{
                  backgroundImage: product.imageUrl ? `url(${product.imageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!product.imageUrl && <span className="p-4 bg-gray-300 rounded-md">Image Placeholder</span>}
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 truncate mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{product.category}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                    <span className="mr-1">⭐</span>
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      const p = prompt('Enter new price:', product.price.toString());
                      if (p) handleUpdatePrice(product.id, parseFloat(p));
                    }}
                    className="flex-1 bg-zinc-900 text-white py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all border border-white/5"
                  >
                    💰 Edit Price
                  </button>
                  <button
                    onClick={() => handleToggleStatus(product.id, true)}
                    className="flex-1 bg-red-600/10 text-red-500 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-600/20 transition-all border border-red-500/20"
                  >
                    🚫 86 Item
                  </button>
                </div>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className="w-full mt-3 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 text-sm font-black uppercase tracking-widest"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        {loading && products.length > 0 && (
          <div className="text-center text-gray-500 p-6 mt-8 bg-white rounded-xl shadow-md">Loading more products...</div>
        )}
      </main>
    </div>
  );
};

const ProductsPage: React.FC = () => {
  return (
    <React.Suspense fallback={<div className="p-10 text-center">Loading products page...</div>}>
      <ProductsPageContent />
    </React.Suspense>
  );
};

export default ProductsPage;