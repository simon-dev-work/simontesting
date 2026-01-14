'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Reset error state when path changes
    setHasError(false);
  }, [pathname]);

  const handleReset = () => setHasError(false);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong
          </h2>
          <p className="mb-6">We&apos;re working on fixing this issue. Please try again later.</p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return children;
}
