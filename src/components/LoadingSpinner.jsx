// LoadingSpinner.jsx
// Reusable loading spinner component

import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] px-4">
      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-yellow-400"></div>
      <p className="mt-4 text-gray-400 text-sm sm:text-base text-center">{message}</p>
    </div>
  );
}
