"use client";

import { useParams } from 'next/navigation';
import { SiteSettingsProvider, useSiteSettings } from '../../context/SiteSettingsContext';
import Link from 'next/link';
import Loader from '../../components/Loader';

function BookingContent() {
  const { customerCode } = useParams();
  const { siteSettings, isLoading } = useSiteSettings();

  if (isLoading) {
    return <Loader />;
  }

  if (!customerCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Customer Code Required</h2>
          <p className="text-gray-600">Please provide a valid customer code</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Banner Section */}
      <div
        className="w-full h-[400px] bg-cover bg-center text-center text-white relative"
        style={{
          backgroundImage: `url(${siteSettings?.banners?.[0]?.bannerImg || '/images/default-banner.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#f3f4f6'
        }}
      >
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center p-4"
          style={{
            fontFamily: siteSettings?.banners?.[0]?.titleGoogleFont || 'sans-serif'
          }}
        >
          <h1 className="text-4xl font-bold mb-4">
            {siteSettings?.banners?.[0]?.title || 'Book an Appointment'}
          </h1>
          <p className="text-xl mb-6 max-w-2xl px-4">
            {siteSettings?.banners?.[0]?.text || 'Schedule your visit with us today'}
          </p>
          <Link 
            href={siteSettings?.banners?.[0]?.buttonLink || "#booking"}
            className="px-8 py-3 bg-primary text-white font-semibold rounded-md hover:bg-white hover:text-primary hover:border-primary border-2 border-transparent transition-all"
          >
            {siteSettings?.banners?.[0]?.buttonText || "Book Now"}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Booking for {siteSettings?.practiceName || 'Our Practice'}
          </h2>
          <p className="text-gray-700 mb-8 text-center">
            Welcome to our online booking system. Please fill out the form below to schedule your appointment.
          </p>
          
          {/* Booking Form Placeholder */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-center text-gray-600">
              Booking form and availability calendar will be implemented here.
            </p>
            <p className="mt-4 text-center text-sm text-gray-500">
              Customer Code: {customerCode}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerCodeBookingPage() {
  const { customerCode } = useParams();

  return (
    <SiteSettingsProvider customerCode={customerCode}>
      <BookingContent />
    </SiteSettingsProvider>
  );
}
