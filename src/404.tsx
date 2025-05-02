'use client'; 

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

const NotFound = () => {
  const router = useRouter();

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      window.location.pathname
    );
  }, []);

  return (
    <div className="min-h-screen w-full bg-blue-50 flex items-center justify-center">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center px-5 text-gray-800">
        <div className="max-w-md">
          <div className="text-5xl font-bold text-blue-600">404</div>
          <p className="text-2xl md:text-3xl font-light leading-normal mt-3">
            Page Not Found
          </p>
          <p className="mb-8 mt-4 text-gray-600">
            The page you're looking for doesn't exist or has been moved. Please
            return to our homepage or contact our support team.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="px-5 py-2.5 text-sm font-medium leading-5 shadow text-white transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-transparent rounded-lg focus:outline-none bg-blue-600 hover:bg-blue-700"
            >
              Back to Homepage
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="px-5 py-2.5 text-sm font-medium leading-5 transition-all duration-300 ease-in-out transform hover:-translate-y-1 border border-blue-600 rounded-lg focus:outline-none bg-white text-blue-600 hover:bg-blue-50"
            >
              Contact Support
            </button>
          </div>
        </div>
        <div className="max-w-lg mt-10 md:mt-0 md:ml-10">
          <div className="relative w-full h-64 md:h-80">
            <Image
              src="/images/medical-404.svg" // Replace with your hospital-themed 404 image
              alt="Medical 404 illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Our medical team is always here to help
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
