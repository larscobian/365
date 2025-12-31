import React from 'react';
import { Search } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      {/* Breadcrumbs & Title */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <HomeIconMini />
          <span>/</span>
          <span>Dashboard</span>
        </div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 bg-[#0f111a] p-1 rounded-xl">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Type here..." 
            className="bg-[#1c1f2e] text-sm text-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-blue-500 w-full md:w-64 transition-colors"
          />
        </div>
      </div>
    </header>
  );
};

const HomeIconMini = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

export default Header;