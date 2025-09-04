import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect - A styled dropdown select component
 * @param {Object} props - Component props
 * @param {string} props.label - Field label
 * @param {Array} props.options - Options to display in the dropdown [{value: string, label: string}]
 * @param {string} props.value - Currently selected value
 * @param {Function} props.onChange - Handler function when selection changes
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.placeholder - Placeholder text when no value is selected
 */
const CustomSelect = ({
  label,
  options = [],
  value,
  onChange,
  required = false,
  className = '',
  placeholder = 'Select an option',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Find the currently selected option
  const selectedOption = options.find((option) => option.value === value);

  // Handle option selection
  const handleOptionClick = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`bg-white dark:bg-gray-800 border ${
          isOpen
            ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-900'
            : 'border-gray-300 dark:border-gray-600'
        } rounded-md px-4 py-2 cursor-pointer flex items-center justify-between`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        {...props}
      >
        <span
          className={
            selectedOption
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={20}
          className={`text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                value === option.value
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-gray-900 dark:text-white'
              }`}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
              {value === option.value && (
                <Check size={16} className="text-primary-600 dark:text-primary-400" />
              )}
            </div>
          ))}
          
          {options.length === 0 && (
            <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
