'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// CRITICAL RULE: NEVER import from @paysurity/auth.
// This mock `useAuth` simulates the expected behavior of a real `useAuth` hook,
// providing dummy `user` and `tenant` data for component functionality.
// In a production environment, `useAuth` would typically be imported from a permitted
// shared context or utility library (e.g., '@paysurity/auth-context') if not from
// the explicitly forbidden '@paysurity/auth' package.
const useAuth = () => {
  const [tenantVertical, setTenantVertical] = useState('restaurant'); // Default for demonstration

  // Simulate loading or setting the tenant vertical from a global state/context/cookie
  useEffect(() => {
    // For local development/testing, you can change this in localStorage
    // e.g., localStorage.setItem('paysurity_tenant_vertical', 'grocery');
    const storedVertical = localStorage.getItem('paysurity_tenant_vertical');
    if (storedVertical && (storedVertical === 'restaurant' || storedVertical === 'grocery')) {
      setTenantVertical(storedVertical);
    }
  }, []);

  const user = {
    id: 'user_123',
    tenantId: 'tenant_abc',
    email: 'john.doe@example.com',
    name: 'John Doe',
  };

  const tenant = {
    id: 'tenant_abc',
    name: 'Awesome Burgers Inc.',
    vertical: tenantVertical, // 'restaurant' or 'grocery'
    plan: 'Premium',
  };

  return { user, tenant };
};

// Placeholder Icons (using simple SVG outlines for demonstration purposes)
// In a real application, these would typically be imported from an icon library (e.g., 'lucide-react')
const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>);
const OrdersIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>);
const CustomersIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const MenuManagementIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>);
const InventoryIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 10A2 2 0 0 1 22 12v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H19a2 2 0 0 1 2 2v.5"/><path d="M12 17v5"/><path d="M9 21h6"/></svg>);
const PayrollIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/><path d="M9 16h6"/></svg>);
const WalletIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3"/><path d="M22 6h-2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2V6z"/><circle cx="16" cy="12" r="2"/></svg>);
const AnalyticsIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8.3L12 15 7.3 10.7 3 15"/></svg>);
const LoyaltyIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L9.19 8.63L2 9.24L7.45 13.06L5.82 19.86L12 16.14L18.18 19.86L16.55 13.06L22 9.24L14.81 8.63L12 2Z"/></svg>);
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>);
const ApiKeysIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2L14 9l-3.5 3.5L7 7l-2 2L11.5 13.5l-2.5 2.5L2 22l6-6 2.5-2.5L16 17l2-2L14.5 10.5 21 4z"/></svg>);
const RestaurantIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2A7 7 0 0 0 5 9c0 5.4 7 13 7 13s7-7.6 7-13a7 7 0 0 0-7-7z"/><path d="M12 9a2 2 0 1 0 0-4a2 2 0 0 0 0 4z"/></svg>);
const GroceryIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4"/><path d="M22 10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2"/><path d="M18 10v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-8"/><path d="M8 4V2h8v2"/></svg>);
const HamburgerIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>);


interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { tenant } = useAuth(); // Using the mock useAuth hook

  const navigationItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
    { name: 'Orders', href: '/orders', icon: OrdersIcon },
    { name: 'Customers', href: '/customers', icon: CustomersIcon },
    { name: 'Menu Management', href: '/menu', icon: MenuManagementIcon },
    { name: 'Inventory', href: '/inventory', icon: InventoryIcon },
    { name: 'Payroll', href: '/payroll', icon: PayrollIcon },
    { name: 'Wallet', href: '/wallet', icon: WalletIcon },
    { name: 'Analytics', href: '/analytics', icon: AnalyticsIcon },
    { name: 'Loyalty', href: '/loyalty', icon: LoyaltyIcon },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
    { name: 'API Keys', href: '/api-keys', icon: ApiKeysIcon },
  ];

  const verticalSections: Record<string, NavItem> = {
    restaurant: { name: 'Restaurant', href: '/restaurant', icon: RestaurantIcon },
    grocery: { name: 'Grocery', href: '/grocery', icon: GroceryIcon },
  };

  const currentVerticalSection = tenant?.vertical ? verticalSections[tenant.vertical] : null;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Close sidebar on route change when on mobile
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [pathname, isOpen]);

  return (
    <>
      {/* Mobile Toggle Button (visible only on small screens) */}
      <button
        type="button"
        className="fixed top-4 left-4 z-40 p-2 rounded-md text-gray-700 bg-white border border-gray-200 shadow-sm md:hidden"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <HamburgerIcon className="h-6 w-6" />
      </button>

      {/* Overlay for mobile (when sidebar is open) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 flex flex-col items-start">
          {/* PaySurity Logo/Branding */}
          <Link href="/dashboard" className="mb-2">
            <h1 className="text-2xl font-extrabold text-indigo-700">PaySurity</h1> {/* Placeholder for actual logo image */}
          </Link>
          {/* Tenant Name + Plan Badge */}
          {tenant && (
            <div className="text-sm text-gray-600 flex items-center">
              <span className="font-semibold text-gray-800">{tenant.name}</span>
              <span className="ml-2 inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                {tenant.plan}
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/')
                      ? 'bg-indigo-100 text-indigo-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              </li>
            ))}

            {/* Vertical-specific section (Restaurant or Grocery) */}
            {currentVerticalSection && (
              <li className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-1">
                  Vertical Specific
                </p>
                <Link
                  href={currentVerticalSection.href}
                  className={`flex items-center p-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    pathname.startsWith(currentVerticalSection.href)
                      ? 'bg-green-100 text-green-700 font-semibold' // Distinct highlight for vertical section
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <currentVerticalSection.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {currentVerticalSection.name} Section
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;