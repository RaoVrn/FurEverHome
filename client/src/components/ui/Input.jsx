import React from 'react';
import { clsx } from 'clsx';

const Input = ({ 
  label, 
  error, 
  helperText,
  type = 'text', 
  className = '', 
  containerClassName = '',
  icon,
  ...props 
}) => {
  const inputClasses = clsx(
    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200',
    {
      'border-red-300 bg-red-50 focus:ring-red-500': error,
      'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-white': !error,
      'pl-10': icon
    },
    className
  );

  return (
    <div className={clsx('relative', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <input
          type={type}
          className={inputClasses}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
