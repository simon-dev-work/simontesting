"use client";

import React from "react";
import Image from "next/image";
import Loader from "../components/Loader";
import { useSiteSettings } from '../context/SiteSettingsContext';

const YouTubePanelPage = () => {
  const { siteSettings, isLoading, error } = useSiteSettings();

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

  return (
    <section id="about" className="w-full overflow-hidden bg-white py-24 md:py-28 flex items-center justify-center min-h-[500px] relative">
      <div className="w-full max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-12 items-center">
          {/* Left-side content - Media (5/8 width) */}
          <div className="lg:col-span-5 w-full aspect-video">
            {siteSettings.service_description?.media_type === 'video' ? (
              <iframe
                className="w-full h-full rounded-lg shadow-lg"
                src={siteSettings.service_description?.media_url || 'https://www.youtube.com/embed/default'}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full relative">
                {siteSettings.service_description?.media_url && (
                  <Image
                    src={siteSettings.service_description.media_url}
                    alt="Featured content"
                    fill
                    className="object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            )}
          </div>
          {/* Right-side content (3/8 width) */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            <h2 className="text-4xl font-bold text-black">
              {siteSettings.service_description?.media_header_text}
            </h2>
            <p className="greyText text-left mb-12 max-w-5xl mx-auto">
              {siteSettings.service_description?.media_body_text}
            </p>
            <div>
              <a
                href={siteSettings.service_description?.media_button_url || '#'}
                className="inline-block px-8 py-3 bg-primary text-white font-semibold rounded-md hover:bg-white hover:text-primary hover:border-primary border-2 border-transparent transition-all"
              >
                {siteSettings.service_description?.media_button_text || 'Learn More'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YouTubePanelPage;