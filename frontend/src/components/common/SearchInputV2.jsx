import React from 'react';
import { Search } from 'lucide-react';

/**
 * SearchInputV2 - Phase 8.2
 * Reusable search input using BANIBS UI v2.0
 */
const SearchInputV2 = ({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-v2" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-v2 w-full pl-10"
      />
    </div>
  );
};

export default SearchInputV2;
