"use client";

import React from "react";
import Image from "next/image";
import Loader from "../components/Loader";
import { useState, useEffect } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import Link from 'next/link'; // Import Link from next/link

const GoogleSectionPage = () => {
  
  const [practiceData, setPracticeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { siteSettings, isLoading, error } = useSiteSettings();

  useEffect(() => {
    const fetchPracticeData = async () => {
      try {
        const response = await fetch('https://passport.nevadacloud.com/api/v1/practice');
        if (!response.ok) {
          throw new Error('Failed to fetch practice data');
        }
        const data = await response.json();
        const obj = Array.isArray(data) ? data[0] : data;
        setPracticeData(obj);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchPracticeData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <section id="about" className="w-full bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center min-h-[300px]">
          <p className="text-red-600">Error loading practice information</p>
        </div>
      </section>
    );
  }

  if (!practiceData || Object.keys(practiceData).length === 0) {
    return (
      <section id="about" className="w-full bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center min-h-[300px]">
          <p className="text-gray-600">Practice information not available</p>
          {/* Debug info for development */}
          <pre style={{color: 'red', fontSize: '12px', marginTop: '1em'}}>
            {JSON.stringify(practiceData, null, 2)}
          </pre>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="w-full bg-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Physical Address</h2>
              <p className="text-gray-600">
                {/* Prefer siteSettings.address_1, fallback to practiceData.address_1 if needed */}
                {siteSettings.address_1 || practiceData?.address_1 || 'No address available'}
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Trading Hours</h2>
              <p className="text-gray-600">
                Week Days: 08:30 - 17:30<br />
                Saturday: 08:30 - 13:00<br />
                Public Holidays: Closed
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Contact Details</h2>
              <p className="text-gray-600">
                <a href={`mailto:${practiceData?.email}`} className="text-black hover:underline">{practiceData?.email}</a><br />
                <a href={`tel:${practiceData?.tel}`} className="text-black hover:underline">{practiceData?.tel}</a><br />
                {/* Show name if available */}
                <span>{practiceData?.name}</span>
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 h-[500px] relative rounded-lg overflow-hidden">
            
          </div>
        </div>
        <div className="mt-8">
          <button
            className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-white hover:text-primary hover:border-primary border-2 border-transparent transition-all"
            style={{ fontSize: '14px' }} // Reduce font size
          >
            <Link href={siteSettings.banners[0].button_link || "/#booking"}>
              {siteSettings.banners[0].button_text || "Make A Booking"}
            </Link>
          </button>
        </div>
      </div>
    </section>
  );
};

export default GoogleSectionPage;