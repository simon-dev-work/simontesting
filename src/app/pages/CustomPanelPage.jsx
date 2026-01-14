"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Loader from "../components/Loader";
import { useSiteSettings } from '../context/SiteSettingsContext';

const CustomPanelPage = () => {
  const { siteSettings, isLoading, error } = useSiteSettings();

  useEffect(() => {
    // No scroll or touch event listeners needed
  }, []);

  if (isLoading) {
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

  if (!siteSettings?.service_description) {
    return (
      <section id="about" className="w-full bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center min-h-[300px]">
          <p className="text-gray-600">Practice information not available</p>
        </div>
      </section>
    );
  }

  const backgroundImage = siteSettings.service_description?.custom_background_image || 'https://via.placeholder.com/1920x1080';

  return (
    <section id="about" className="w-full overflow-hidden bg-gray-100 py-6 md:py-8 flex items-center justify-center min-h-[600px] relative">
      {/* Static Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full parallax-bg"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundAttachment: 'fixed',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.9,
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-full space-y-6">
            <h2 className="text-5xl text-center font-bold text-white mb-5">
              {siteSettings.service_description?.custom_heading_text}
            </h2>
          </div>
          <div className="w-full space-y-6">
            <p className="text-lg text-white font-roboto text-[#333] leading-[1.7] text-center mb-12 max-w-5xl mx-auto">
              {siteSettings.service_description?.custom_body_text}
            </p>
          </div>
          <div className="w-full flex justify-center mt-8">
            <a
              href={siteSettings.service_description?.custom_button_url || '#'}
              className="px-8 py-3 bg-primary text-white font-semibold rounded-md hover:bg-white hover:text-primary hover:border-primary border-2 border-transparent transition-all"
            >
              {siteSettings.service_description?.custom_button_text || 'Learn More'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomPanelPage;