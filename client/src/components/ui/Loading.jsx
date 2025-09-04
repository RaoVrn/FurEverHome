import React from 'react';
import { Heart } from 'lucide-react';

const Loading = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <Heart className={`animate-pulse ${sizes[size]} text-primary-600`} />
        <Heart className={`${sizes[size]} text-primary-400 absolute top-0 left-0 transform scale-75 opacity-50 animate-ping`} />
      </div>
      {text && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 animate-pulse">{text}</p>
      )}
    </div>
  );
};

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Heart className="h-16 w-16 text-primary-500 animate-pulse" />
            <Heart className="h-16 w-16 text-primary-300 absolute top-0 left-0 transform scale-75 opacity-75 animate-ping" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          FurEverHome
        </h2>
        <p className="text-gray-600 dark:text-gray-400 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};

export { LoadingScreen };
export default Loading;
