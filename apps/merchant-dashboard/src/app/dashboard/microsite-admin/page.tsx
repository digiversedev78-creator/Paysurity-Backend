"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// --- Mock API Helpers ---
const MOCK_API_DELAY = 800; // Simulate network latency

const mockMicrositeSettings = {
  restaurantName: "The Gourmet Bistro",
  description: "Experience fine dining with a modern twist in a cozy atmosphere.",
  address: "123 Main St, Anytown, CA 90210",
  phone: "555-123-4567",
  heroImageUrl: "/placeholder-hero.jpg", // Placeholder
  heroColor: "#6B7280", // Default grey
  domainStatus: "active" as "active" | "pending" | "inactive",
};

const mockMenuCategories = [
  {
    id: "cat-1",
    name: "Appetizers",
    items: [
      { id: "item-1", categoryId: "cat-1", name: "Crispy Calamari", description: "Fried calamari with spicy marinara sauce.", basePrice: 12.00 },
      { id: "item-2", categoryId: "cat-1", name: "Bruschetta", description: "Toasted bread with fresh tomatoes, basil, and balsamic glaze.", basePrice: 9.50 },
    ],
  },
  {
    id: "cat-2",
    name: "Main Courses",
    items: [
      { id: "item-3", categoryId: "cat-2", name: "Grilled Salmon", description: "Atlantic salmon with roasted vegetables and lemon-dill sauce.", basePrice: 25.00 },
      { id: "item-4", categoryId: "cat-2", name: "Ribeye Steak", description: "12oz Ribeye steak served with mashed potatoes and asparagus.", basePrice: 32.00 },
    ],
  },
  {
    id: "cat-3",
    name: "Desserts",
    items: [
      { id: "item-5", categoryId: "cat-3", name: "Chocolate Lava Cake", description: "Warm chocolate cake with a molten center, served with vanilla ice cream.", basePrice: 10.00 },
    ],
  },
];

const mockTenantPricing = {
  paxSurityMargin: 0.20, // Default 20%
  processingFee: 0.05, // Fixed 5%
};

const mockPosSyncStatus = {
  lastSyncTimestamp: new Date().toISOString(),
  autoSyncEnabled: true,
};

// --- Interfaces ---
interface MicrositeSettings {
  restaurantName: string;
  description: string;
  address: string;
  phone: string;
  heroImageUrl: string;
  heroColor: string;
  domainStatus: 'active' | 'pending' | 'inactive';
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface TenantPricing {
  paxSurityMargin: number;
  processingFee: number;
}

interface PosSyncStatus {
  lastSyncTimestamp: string;
  autoSyncEnabled: boolean;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// --- API Calls (Mocked) ---
const fetchSettings = async (): Promise<ApiResponse<MicrositeSettings>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockMicrositeSettings, success: true });
    }, MOCK_API_DELAY);
  });
};

const updateSettings = async (settings: MicrositeSettings): Promise<ApiResponse<MicrositeSettings>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      Object.assign(mockMicrositeSettings, settings); // Update mock data
      resolve({ data: mockMicrositeSettings, success: true });
    }, MOCK_API_DELAY);
  });
};

const fetchMenu = async (): Promise<ApiResponse<MenuCategory[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockMenuCategories, success: true });
    }, MOCK_API_DELAY);
  });
};

const addMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<ApiResponse<MenuItem>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newItem = { ...item, id: `item-${Date.now()}` };
      const category = mockMenuCategories.find(cat => cat.id === item.categoryId);
      if (category) {
        category.items.push(newItem);
        resolve({ data: newItem, success: true });
      } else {
        resolve({ error: "Category not found", success: false });
      }
    }, MOCK_API_DELAY);
  });
};

const updateMenuItem = async (item: MenuItem): Promise<ApiResponse<MenuItem>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const category = mockMenuCategories.find(cat => cat.id === item.categoryId);
      if (category) {
        const itemIndex = category.items.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
          category.items[itemIndex] = item;
          resolve({ data: item, success: true });
        } else {
          resolve({ error: "Item not found", success: false });
        }
      } else {
        resolve({ error: "Category not found", success: false });
      }
    }, MOCK_API_DELAY);
  });
};

const deleteMenuItem = async (categoryId: string, itemId: string): Promise<ApiResponse<string>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const category = mockMenuCategories.find(cat => cat.id === categoryId);
      if (category) {
        const initialLength = category.items.length;
        category.items = category.items.filter(i => i.id !== itemId);
        if (category.items.length < initialLength) {
          resolve({ data: itemId, success: true });
        } else {
          resolve({ error: "Item not found", success: false });
        }
      } else {
        resolve({ error: "Category not found", success: false });
      }
    }, MOCK_API_DELAY);
  });
};

const fetchPricingConfig = async (): Promise<ApiResponse<TenantPricing>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockTenantPricing, success: true });
    }, MOCK_API_DELAY);
  });
};

const updatePricingConfig = async (pricing: TenantPricing): Promise<ApiResponse<TenantPricing>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      Object.assign(mockTenantPricing, pricing); // Update mock data
      resolve({ data: mockTenantPricing, success: true });
    }, MOCK_API_DELAY);
  });
};

const fetchPosSyncStatus = async (): Promise<ApiResponse<PosSyncStatus>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockPosSyncStatus, success: true });
    }, MOCK_API_DELAY);
  });
};

const syncPosNow = async (): Promise<ApiResponse<PosSyncStatus>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockPosSyncStatus.lastSyncTimestamp = new Date().toISOString();
      resolve({ data: mockPosSyncStatus, success: true });
    }, MOCK_API_DELAY);
  });
};

const toggleAutoSync = async (enabled: boolean): Promise<ApiResponse<PosSyncStatus>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockPosSyncStatus.autoSyncEnabled = enabled;
      resolve({ data: mockPosSyncStatus, success: true });
    }, MOCK_API_DELAY);
  });
};

// --- Helper Components for UI (Tailwind based Glassmorphism) ---

const GlassPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`
    bg-gray-800 bg-opacity-30 backdrop-filter backdrop-blur-lg
    border border-gray-700 border-opacity-40 rounded-xl
    shadow-lg p-6 ${className || ''}
  `}>
    {children}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    className="w-full px-4 py-2 bg-gray-700 bg-opacity-40 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 outline-none transition duration-200 ease-in-out"
    {...props}
  />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    className="w-full px-4 py-2 bg-gray-700 bg-opacity-40 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 outline-none transition duration-200 ease-in-out"
    rows={3}
    {...props}
  />
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ children, variant = 'primary', className, ...props }) => {
  const baseClasses = "px-5 py-2 rounded-lg font-medium transition duration-200 ease-in-out";
  const variantClasses = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900",
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    className={`
      px-6 py-3 rounded-t-lg text-lg font-semibold
      ${active ? 'bg-purple-700 bg-opacity-50 text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}
      transition duration-200 ease-in-out
    `}
    onClick={onClick}
  >
    {children}
  </button>
);

const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex justify-center items-center ${className}`}>
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <GlassPanel className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div>
          {children}
        </div>
      </GlassPanel>
    </div>
  );
};

// --- Page Components ---

const MicrositeSettingsTab: React.FC<{ settings: MicrositeSettings | null; onSave: (settings: MicrositeSettings) => Promise<void>; isLoading: boolean }> = ({ settings, onSave, isLoading }) => {
  const [formState, setFormState] = useState<MicrositeSettings>(settings || mockMicrositeSettings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (settings) {
      setFormState(settings);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      await onSave(formState);
      setSaveStatus('success');
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus('idle'), 3000); // Reset status after a delay
    }
  };

  if (!settings && isLoading) {
    return <LoadingSpinner className="h-64" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="restaurantName" className="block text-gray-300 text-sm font-medium mb-2">Restaurant Name</label>
          <Input id="restaurantName" name="restaurantName" value={formState.restaurantName} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="address" className="block text-gray-300 text-sm font-medium mb-2">Address</label>
          <Input id="address" name="address" value={formState.address} onChange={handleChange} required />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-gray-300 text-sm font-medium mb-2">Description</label>
        <Textarea id="description" name="description" value={formState.description} onChange={handleChange} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className="block text-gray-300 text-sm font-medium mb-2">Phone</label>
          <Input id="phone" name="phone" value={formState.phone} onChange={handleChange} type="tel" required />
        </div>
        <div>
          <label htmlFor="heroColor" className="block text-gray-300 text-sm font-medium mb-2">Hero Color</label>
          <Input id="heroColor" name="heroColor" type="color" value={formState.heroColor} onChange={handleChange} className="h-10 p-1 block w-24" />
        </div>
      </div>

      <div>
        <label htmlFor="heroImage" className="block text-gray-300 text-sm font-medium mb-2">Hero Image</label>
        <div className="flex items-center space-x-4">
          <Input id="heroImage" name="heroImageUrl" type="text" value={formState.heroImageUrl} onChange={handleChange} placeholder="Image URL (placeholder)" className="flex-grow" />
          <Button type="button" variant="secondary" className="whitespace-nowrap">Upload Image</Button>
        </div>
        {formState.heroImageUrl && <img src={formState.heroImageUrl} alt="Hero Preview" className="mt-4 max-h-48 object-cover rounded-lg" />}
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Domain Status</label>
        <span className={`
          inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
          ${formState.domainStatus === 'active' ? 'bg-green-500/20 text-green-300 border border-green-500/40' :
            formState.domainStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
            'bg-red-500/20 text-red-300 border border-red-500/40'}
        `}>
          <span className={`w-2 h-2 rounded-full mr-2 ${formState.domainStatus === 'active' ? 'bg-green-400' : formState.domainStatus === 'pending' ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
          {formState.domainStatus.charAt(0).toUpperCase() + formState.domainStatus.slice(1)}
        </span>
      </div>

      <div className="flex justify-end items-center space-x-4">
        {saveStatus === 'saving' && <LoadingSpinner className="h-6 w-6" />}
        {saveStatus === 'success' && <span className="text-green-500">Settings saved!</span>}
        {saveStatus === 'error' && <span className="text-red-500">Error saving settings.</span>}
        <Button type="submit" disabled={isLoading || saveStatus === 'saving'}>
          {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
};

const MenuItemForm: React.FC<{
  item: MenuItem | null;
  categoryId: string;
  onSave: (item: MenuItem | Omit<MenuItem, 'id'>) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}> = ({ item, categoryId, onSave, onClose, isLoading }) => {
  const [formState, setFormState] = useState<Omit<MenuItem, 'id'> & { id?: string }>(item || { categoryId, name: '', description: '', basePrice: 0 });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (item) {
      setFormState(item);
    } else {
      setFormState({ categoryId, name: '', description: '', basePrice: 0 });
    }
  }, [item, categoryId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: name === 'basePrice' ? parseFloat(value) || 0 : value }));
  };

  const calculatePrices = useCallback((basePrice: number) => {
    const paysurityMarginFactor = 1.20; // 20%
    const processingFeeFactor = 1.05; // 5%
    const customerPays = basePrice * processingFeeFactor * paysurityMarginFactor;
    return { customerPays, youReceive: basePrice };
  }, []);

  const { customerPays, youReceive } = calculatePrices(formState.basePrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      await onSave(formState as MenuItem); // Cast to MenuItem for update, or Omit for add
      setSaveStatus('success');
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Failed to save menu item:", error);
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus('idle'), 3000); // Reset status after a delay
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="itemName" className="block text-gray-300 text-sm font-medium mb-2">Item Name</label>
        <Input id="itemName" name="name" value={formState.name} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="itemDescription" className="block text-gray-300 text-sm font-medium mb-2">Description</label>
        <Textarea id="itemDescription" name="description" value={formState.description} onChange={handleChange} required />
      </div>
      <div>
        <label htmlFor="basePrice" className="block text-gray-300 text-sm font-medium mb-2">Base Price (What you want to receive)</label>
        <Input id="basePrice" name="basePrice" type="number" step="0.01" value={formState.basePrice.toFixed(2)} onChange={handleChange} required />
      </div>

      <div className="text-gray-300 text-sm">
        <p>You receive: <span className="font-semibold text-purple-300">${youReceive.toFixed(2)}</span></p>
        <p>Customer pays: <span className="font-semibold text-purple-300">${customerPays.toFixed(2)}</span></p>
        <p className="text-xs text-gray-400"> (Includes 5% processing fee and 20% PaySurity margin)</p>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading || saveStatus === 'saving'}>Cancel</Button>
        <Button type="submit" disabled={isLoading || saveStatus === 'saving'}>
          {saveStatus === 'saving' ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
        </Button>
      </div>
      {saveStatus === 'error' && <p className="text-red-500 mt-2">Error saving item.</p>}
    </form>
  );
};

const MenuManagementTab: React.FC<{
  menu: MenuCategory[] | null;
  onUpdateItem: (item: MenuItem) => Promise<void>;
  onAddItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  onDeleteItem: (categoryId: string, itemId: string) => Promise<void>;
  isLoading: boolean;
}> = ({ menu, onUpdateItem, onAddItem, onDeleteItem, isLoading }) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [modalLoading, setModalLoading] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddItem = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedCategoryId(item.categoryId);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (item: MenuItem | Omit<MenuItem, 'id'>) => {
    setModalLoading(true);
    try {
      if ((item as MenuItem).id) {
        await onUpdateItem(item as MenuItem);
      } else {
        await onAddItem(item as Omit<MenuItem, 'id'>);
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (categoryId: string, itemId: string) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      await onDeleteItem(categoryId, itemId);
    }
  };

  if (isLoading && !menu) {
    return <LoadingSpinner className="h-64" />;
  }

  return (
    <div className="space-y-6">
      {menu?.map(category => (
        <GlassPanel key={category.id} className="p-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleCategory(category.id)}>
            <h4 className="text-xl font-semibold text-white">{category.name}</h4>
            <div className="flex items-center space-x-4">
              <Button type="button" variant="secondary" onClick={(e) => { e.stopPropagation(); handleAddItem(category.id); }} className="text-sm px-3 py-1">
                + Add Item
              </Button>
              <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedCategories.includes(category.id) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {expandedCategories.includes(category.id) && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700 bg-gray-900 bg-opacity-30 rounded-lg">
                <thead className="bg-gray-800 bg-opacity-40">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Item Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">You Receive</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer Pays</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {category.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-center">No items in this category.</td>
                    </tr>
                  ) : (
                    category.items.map(item => {
                      const paysurityMarginFactor = 1.20; // 20%
                      const processingFeeFactor = 1.05; // 5%
                      const customerPays = item.basePrice * processingFeeFactor * paysurityMarginFactor;
                      return (
                        <tr key={item.id} className="hover:bg-gray-800 hover:bg-opacity-40 transition duration-150 ease-in-out">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-300 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{item.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">${item.basePrice.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">${customerPays.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <Button variant="secondary" onClick={() => handleEditItem(item)} className="text-xs px-3 py-1">Edit</Button>
                            <Button variant="danger" onClick={() => handleDelete(category.id, item.id)} className="text-xs px-3 py-1">Delete</Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </GlassPanel>
      ))}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { if (!modalLoading) setIsModalOpen(false); }}
        title={editingItem ? "Edit Menu Item" : "Add New Menu Item"}
      >
        <MenuItemForm
          item={editingItem}
          categoryId={selectedCategoryId}
          onSave={handleSaveItem}
          onClose={() => setIsModalOpen(false)}
          isLoading={modalLoading}
        />
      </Modal>
    </div>
  );
};

const PricingConfigTab: React.FC<{
  pricing: TenantPricing | null;
  onSave: (pricing: TenantPricing) => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
}> = ({ pricing, onSave, isLoading, isAdmin }) => {
  const [formState, setFormState] = useState<TenantPricing>(pricing || mockTenantPricing);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (pricing) {
      setFormState(pricing);
    }
  }, [pricing]);

  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) / 100; // Convert percentage to decimal
    setFormState(prev => ({ ...prev, paxSurityMargin: value }));
  };

  const calculatePreviewPrices = useCallback((basePrice: number, margin: number, fee: number) => {
    const customerPays = basePrice * (1 + fee) * (1 + margin);
    return { customerPays, youReceive: basePrice };
  }, []);

  const { customerPays, youReceive } = calculatePreviewPrices(10.00, formState.paxSurityMargin, formState.processingFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      await onSave(formState);
      setSaveStatus('success');
    } catch (error) {
      console.error("Failed to save pricing config:", error);
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (!isAdmin) {
    return (
      <GlassPanel className="p-8 text-center text-red-400">
        <h3 className="text-2xl font-bold mb-4">Access Denied</h3>
        <p>You do not have administrative privileges to view or modify pricing configurations.</p>
        <p>Please contact your system administrator.</p>
      </GlassPanel>
    );
  }

  if (!pricing && isLoading) {
    return <LoadingSpinner className="h-64" />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="paxSurityMargin" className="block text-gray-300 text-sm font-medium mb-2">PaySurity Margin: <span className="text-purple-300 font-semibold">{(formState.paxSurityMargin * 100).toFixed(0)}%</span></label>
        <Input
          id="paxSurityMargin"
          name="paxSurityMargin"
          type="range"
          min="0"
          max="50"
          step="1"
          value={(formState.paxSurityMargin * 100).toFixed(0)}
          onChange={handleMarginChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-purple-500 [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none"
        />
      </div>

      <div>
        <label htmlFor="processingFee" className="block text-gray-300 text-sm font-medium mb-2">Processing Fee (Fixed)</label>
        <Input id="processingFee" name="processingFee" type="text" value={(formState.processingFee * 100).toFixed(0) + '%'} readOnly className="cursor-not-allowed" />
      </div>

      <GlassPanel className="p-4 bg-gray-800 bg-opacity-40 border-gray-600">
        <h4 className="text-lg font-semibold text-white mb-2">Real-time Price Preview (for a $10 base item)</h4>
        <p className="text-gray-300">You receive: <span className="font-semibold text-purple-300">${youReceive.toFixed(2)}</span></p>
        <p className="text-gray-300">Customer pays: <span className="font-semibold text-purple-300">${customerPays.toFixed(2)}</span></p>
      </GlassPanel>

      <div className="flex justify-end items-center space-x-4">
        {saveStatus === 'saving' && <LoadingSpinner className="h-6 w-6" />}
        {saveStatus === 'success' && <span className="text-green-500">Pricing saved!</span>}
        {saveStatus === 'error' && <span className="text-red-500">Error saving pricing.</span>}
        <Button type="submit" disabled={isLoading || saveStatus === 'saving'}>
          {saveStatus === 'saving' ? 'Saving...' : 'Save Pricing'}
        </Button>
      </div>
    </form>
  );
};

const PosSyncStatusPanel: React.FC<{
  status: PosSyncStatus | null;
  onSyncNow: () => Promise<void>;
  onToggleAutoSync: (enabled: boolean) => Promise<void>;
  isLoading: boolean;
}> = ({ status, onSyncNow, onToggleAutoSync, isLoading }) => {
  const [syncLoading, setSyncLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const handleSyncNow = async () => {
    setSyncLoading(true);
    try {
      await onSyncNow();
    } finally {
      setSyncLoading(false);
    }
  };

  const handleToggleAutoSync = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setToggleLoading(true);
    try {
      await onToggleAutoSync(e.target.checked);
    } finally {
      setToggleLoading(false);
    }
  };

  const formattedTimestamp = status?.lastSyncTimestamp ? new Date(status.lastSyncTimestamp).toLocaleString() : 'N/A';

  return (
    <GlassPanel className="p-6">
      <h3 className="text-xl font-semibold text-white mb-4">POS Sync Status</h3>
      {isLoading && !status ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          <p className="text-gray-300">Last Sync: <span className="font-semibold text-purple-300">{formattedTimestamp}</span></p>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Auto-sync on POS change:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={status?.autoSyncEnabled || false}
                onChange={handleToggleAutoSync}
                disabled={toggleLoading || isLoading}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              {toggleLoading && <LoadingSpinner className="ml-2 h-4 w-4 absolute right-0" />}
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSyncNow} disabled={syncLoading || isLoading}>
              {syncLoading ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>
      )}
    </GlassPanel>
  );
};


// --- Main Page Component ---
const MicrositeAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings', 'menu', 'pricing'
  const [settings, setSettings] = useState<MicrositeSettings | null>(null);
  const [menu, setMenu] = useState<MenuCategory[] | null>(null);
  const [pricing, setPricing] = useState<TenantPricing | null>(null);
  const [posStatus, setPosStatus] = useState<PosSyncStatus | null>(null);

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [isLoadingPosStatus, setIsLoadingPosStatus] = useState(true);

  // Mock tenantId and isAdmin status (would come from auth context in real app)
  const tenantId = "mock-tenant-123";
  const isAdmin = true; // Set to false to test admin restriction

  // Fetch all data on component mount
  useEffect(() => {
    const loadData = async () => {
      // Settings
      setIsLoadingSettings(true);
      const settingsRes = await fetchSettings();
      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      } else {
        console.error("Failed to fetch settings:", settingsRes.error);
      }
      setIsLoadingSettings(false);

      // Menu
      setIsLoadingMenu(true);
      const menuRes = await fetchMenu();
      if (menuRes.success && menuRes.data) {
        setMenu(menuRes.data);
      } else {
        console.error("Failed to fetch menu:", menuRes.error);
      }
      setIsLoadingMenu(false);

      // Pricing (only if admin)
      if (isAdmin) {
        setIsLoadingPricing(true);
        const pricingRes = await fetchPricingConfig();
        if (pricingRes.success && pricingRes.data) {
          setPricing(pricingRes.data);
        } else {
          console.error("Failed to fetch pricing config:", pricingRes.error);
        }
        setIsLoadingPricing(false);
      }

      // POS Sync Status
      setIsLoadingPosStatus(true);
      const posRes = await fetchPosSyncStatus();
      if (posRes.success && posRes.data) {
        setPosStatus(posRes.data);
      } else {
        console.error("Failed to fetch POS sync status:", posRes.error);
      }
      setIsLoadingPosStatus(false);
    };
    loadData();
  }, [isAdmin]);

  // Handlers for API interactions
  const handleSaveSettings = useCallback(async (newSettings: MicrositeSettings) => {
    const res = await updateSettings(newSettings);
    if (res.success && res.data) {
      setSettings(res.data);
    } else {
      throw new Error(res.error || "Failed to save settings");
    }
  }, []);

  const handleUpdateMenuItem = useCallback(async (item: MenuItem) => {
    const res = await updateMenuItem(item);
    if (res.success && res.data) {
      setMenu(prevMenu => prevMenu ? prevMenu.map(cat =>
        cat.id === item.categoryId ? { ...cat, items: cat.items.map(i => i.id === item.id ? res.data! : i) } : cat
      ) : null);
    } else {
      throw new Error(res.error || "Failed to update menu item");
    }
  }, []);

  const handleAddMenuItem = useCallback(async (item: Omit<MenuItem, 'id'>) => {
    const res = await addMenuItem(item);
    if (res.success && res.data) {
      setMenu(prevMenu => prevMenu ? prevMenu.map(cat =>
        cat.id === item.categoryId ? { ...cat, items: [...cat.items, res.data!] } : cat
      ) : null);
    } else {
      throw new Error(res.error || "Failed to add menu item");
    }
  }, []);

  const handleDeleteMenuItem = useCallback(async (categoryId: string, itemId: string) => {
    const res = await deleteMenuItem(categoryId, itemId);
    if (res.success) {
      setMenu(prevMenu => prevMenu ? prevMenu.map(cat =>
        cat.id === categoryId ? { ...cat, items: cat.items.filter(i => i.id !== itemId) } : cat
      ) : null);
    } else {
      throw new Error(res.error || "Failed to delete menu item");
    }
  }, []);

  const handleSavePricing = useCallback(async (newPricing: TenantPricing) => {
    const res = await updatePricingConfig(newPricing);
    if (res.success && res.data) {
      setPricing(res.data);
    } else {
      throw new Error(res.error || "Failed to save pricing config");
    }
  }, []);

  const handleSyncPos = useCallback(async () => {
    const res = await syncPosNow();
    if (res.success && res.data) {
      setPosStatus(res.data);
    } else {
      throw new Error(res.error || "Failed to sync POS");
    }
  }, []);

  const handleToggleAutoSync = useCallback(async (enabled: boolean) => {
    const res = await toggleAutoSync(enabled);
    if (res.success && res.data) {
      setPosStatus(res.data);
    } else {
      throw new Error(res.error || "Failed to toggle auto sync");
    }
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Microsite Admin Panel
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassPanel>
            <PosSyncStatusPanel
              status={posStatus}
              onSyncNow={handleSyncPos}
              onToggleAutoSync={handleToggleAutoSync}
              isLoading={isLoadingPosStatus}
            />
          </GlassPanel>
        </div>

        <div className="border-b border-gray-700 mb-6 flex space-x-2 overflow-x-auto">
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
            Microsite Settings
          </TabButton>
          <TabButton active={activeTab === 'menu'} onClick={() => setActiveTab('menu')}>
            Menu Management
          </TabButton>
          <TabButton active={activeTab === 'pricing'} onClick={() => setActiveTab('pricing')}>
            Pricing Config
          </TabButton>
        </div>

        <GlassPanel>
          {activeTab === 'settings' && (
            <MicrositeSettingsTab
              settings={settings}
              onSave={handleSaveSettings}
              isLoading={isLoadingSettings}
            />
          )}

          {activeTab === 'menu' && (
            <MenuManagementTab
              menu={menu}
              onUpdateItem={handleUpdateMenuItem}
              onAddItem={handleAddMenuItem}
              onDeleteItem={handleDeleteMenuItem}
              isLoading={isLoadingMenu}
            />
          )}

          {activeTab === 'pricing' && (
            <PricingConfigTab
              pricing={pricing}
              onSave={handleSavePricing}
              isLoading={isLoadingPricing}
              isAdmin={isAdmin}
            />
          )}
        </GlassPanel>
      </div>
    </div>
  );
};

export default MicrositeAdminPage;