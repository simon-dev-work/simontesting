import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Oops... Page not found
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            We couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <p className="text-gray-600">
            Please email support or chat with us below:
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@nevadacloud.com"
              className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Email Support
            </a>
            
            <a
              href="https://wa.me/27795800964"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-black flex items-center justify-center gap-2"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}