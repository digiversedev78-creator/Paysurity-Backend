'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/use-debounce'; // Will create this hook
import Link from 'next/link';
import { RoleEnum, PaginationDto } from '@paysurity/types';
import { API_URL, ADMIN_HEADERS } from '../../lib/constants';

interface SearchResultMetadata {
  vertical?: string;
  type?: string;
  role?: RoleEnum;
}

interface SearchResult {
  id: string;
  name: string;
  type: string;
  metadata?: SearchResultMetadata;
}


export function OmniSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  
  // Strict Pagination binding for future list rendering
  const currentPagination: PaginationDto = { page: 1, limit: 10 };
  const [loading, setLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    // Hitting the real nest endpoint
    fetch(`${API_URL}/admin/search?q=${encodeURIComponent(debouncedQuery)}`, {
      headers: ADMIN_HEADERS
    })
      .then(res => res.json())
      .then((data: SearchResult[] | null) => {
        setResults(data || []);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="relative group w-96">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Omni-Search (Tenants, Users, Merchants)..."
        className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Dropdown */}
      {query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
           {loading && <div className="p-4 text-xs text-zinc-500 text-center">Searching...</div>}
           {!loading && results.length === 0 && <div className="p-4 text-xs text-zinc-500 text-center">No results found</div>}
           
           {!loading && results.length > 0 && (
             <div className="max-h-96 overflow-y-auto py-2">
               {results.map((r, i) => (
                 <Link key={i} href={`/${r.type.toLowerCase()}s/${r.id}`} className="block px-4 py-2 hover:bg-zinc-800 transition-colors">
                   <div className="flex justify-between items-center">
                     <div>
                       <span className="text-sm font-medium">{r.name}</span>
                       <span className="block text-xs text-zinc-500 capitalize">{r.type.toLowerCase()} | {r.metadata?.vertical || r.metadata?.type || r.metadata?.role || 'N/A'}</span>
                     </div>
                     <span className="text-[10px] uppercase bg-zinc-800 px-2 py-1 rounded text-zinc-400 border border-zinc-700">{r.type}</span>
                   </div>
                 </Link>
               ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
}
