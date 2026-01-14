"use client";

import React from "react";
import Image from "next/image";
import Loader from "../components/Loader";
import { useSiteSettings } from '../context/SiteSettingsContext';

const AboutPage = () => {
  const { siteSettings, isLoading, error } = useSiteSettings();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <section id="about" className="w-full bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center min-h-[300px]">
          <p className="text-red-600">Error loading practice information</p>
        </div>
      </section>
    );
  }

  if (!siteSettings?.aboutText) {
    return (
      <section id="about" className="w-full bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center min-h-[300px]">
          <p className="text-gray-600">Practice information not available</p>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="w-full bg-gray-50 pt-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 space-y-4">
            <h2 className="text-4xl font-bold text-black">About Our Practice</h2>
            <div
              className="font-[Roboto] text-lg text-[#333] leading-[1.7] text-start mb-8 max-w-5xl mx-auto"
              dangerouslySetInnerHTML={{ __html: siteSettings.aboutText }}
            />
          </div>
          <div className="w-full md:w-1/2 h-[500px] relative overflow-hidden">
            <Image
              src={(siteSettings.about && siteSettings.about.img) || "https://s3.eu-west-2.amazonaws.com/ocumailuserdata/1606406649_67_about_banner.png"}
              alt="About Our Practice"
              fill
              style={{ objectFit: "contain" }}
              className="object-cover object-bottom md:object-contain md:object-center"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;