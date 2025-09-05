import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';

const SearchableLocationInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'city', // 'city', 'state', 'country'
  required = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sample data - in a real app, this would come from an API
  const locationData = {
    city: [
      'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
      'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
      'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad',
      'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada',
      'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Thiruvananthapuram', 'Solapur', 'Hubballi-Dharwad', 'Tiruchirappalli',
      'Bareilly', 'Mysore', 'Tiruppur', 'Gurgaon', 'Aligarh', 'Jalandhar', 'Bhubaneswar', 'Salem', 'Mira-Bhayandar', 'Warangal'
    ],
    state: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
      'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
      'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
      'Ladakh', 'Puducherry', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep',
      'Andaman and Nicobar Islands'
    ],
    country: [
      'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan',
      'China', 'Brazil', 'Mexico', 'Russia', 'Italy', 'Spain', 'South Korea', 'Netherlands', 'Switzerland',
      'Belgium', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Austria', 'Ireland', 'New Zealand', 'Singapore',
      'Thailand', 'Malaysia', 'Philippines', 'Indonesia', 'Vietnam', 'South Africa', 'Egypt', 'UAE', 'Saudi Arabia'
    ]
  };

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterSuggestions = (term) => {
    if (!term || term.length < 1) return [];
    
    const data = locationData[type] || [];
    return data
      .filter(item => 
        item.toLowerCase().includes(term.toLowerCase())
      )
      .slice(0, 8); // Limit to 8 suggestions
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    if (newValue.length >= 1) {
      setLoading(true);
      // Simulate API delay
      setTimeout(() => {
        setSuggestions(filterSuggestions(newValue));
        setLoading(false);
        setIsOpen(true);
      }, 200);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
    
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    onChange(suggestion);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    } else if (searchTerm.length >= 1) {
      setSuggestions(filterSuggestions(searchTerm));
      setIsOpen(true);
    }
  };

  const clearInput = () => {
    setSearchTerm('');
    onChange('');
    setIsOpen(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder || `Search ${type}...`}
          required={required}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
        />
        
        {searchTerm && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        {loading && (
          <div className="absolute inset-y-0 right-8 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none text-gray-900 dark:text-white first:rounded-t-lg last:rounded-b-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-sm">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && searchTerm.length >= 1 && suggestions.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            No {type} found matching "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableLocationInput;
