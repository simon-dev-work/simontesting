"use client";
//============================ 
/* THIS IS THE WORKING PAGE */
//============================ 
import React, { useEffect, useState } from "react";
import Loader from "../components/Loader";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Link from "next/link";
import CounterPage from "./CounterPage";
import CustomPanelPage from "./CustomPanelPage";
import YouTubePanelPage from "./YouTubePanelPage";
import AboutPage from "./AboutPage";
import ServicesPage from "./ServicesPage";
import TeamPage from "./TeamPage";
import RecentBlogs from "./RecentBlogs";
import BrandsPage from "./BrandsPage";
import BookingPage from "./BookingPage";
import TestimonialsPage from "./TestimonialsPage";
import ConnectWithUsPage from "./ConnectWithUsPage";
import { useSiteSettings } from '../context/SiteSettingsContext';
import { FaWhatsapp } from 'react-icons/fa';

export default function HomePage({ customerCode }) {
  const { siteSettings, isLoading, error } = useSiteSettings();

  // Load Google Fonts dynamically like your Ruby version
  useEffect(() => {
    if (!siteSettings?.banners) return;

    const fonts = new Set();
    siteSettings.banners.forEach(banner => {
      if (banner.titleGoogleFont) fonts.add(banner.titleGoogleFont);
      if (banner.textGoogleFont) fonts.add(banner.textGoogleFont);
    });

    // Remove existing font links to avoid duplicates
    document.querySelectorAll('link[data-google-font]').forEach(link => link.remove());

    // Add new font links to document head (like your Ruby version)
    fonts.forEach(font => {
      const weight = font === 'Honk' ? '400' : '300;400;500;600;700';
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@${weight}&display=swap`;
      link.rel = 'stylesheet';
      link.setAttribute('data-google-font', 'true');
      document.head.appendChild(link);
    });

    // Add custom CSS to override default fonts
    const style = document.createElement('style');
    const titleFont = siteSettings.banners[0]?.titleGoogleFont || 'Roboto';
    const textFont = siteSettings.banners[0]?.textGoogleFont || 'Roboto';

    style.textContent = `
      .honk-font {
        font-family: "${titleFont}", "Roboto", "Raleway", sans-serif !important;
      }
      .roboto-font {
        font-family: "${textFont}", "Raleway", sans-serif !important;
      }
    `;
    document.head.appendChild(style);
  }, [siteSettings]);

  // Handle anchor scrolling when navigating from other pages
  useEffect(() => {
    if (!isLoading && typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      const id = hash.replace('#', '');

      // Use a small timeout to ensure the DOM has fully rendered
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // 500ms gives enough time for sections to mount

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading) {
    return <Loader />;
  }

  if (!siteSettings?.banners || siteSettings.banners.length === 0) {
    return (
      <div className="w-full h-[600px] bg-cover bg-center text-center text-white">
        <p>No banner information available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Home Page Section */}
      {siteSettings.banners.length > 0 && (
        <div
          className="w-full h-[600px] bg-cover bg-center text-center text-white"
          style={{
            backgroundImage: `url(${siteSettings.banners[0].bannerImg})`,
          }}
        >
          <div
            className="bg-black bg-opacity-50 h-full flex flex-col items-center justify-center p-4"
          >
            <p className={`honk-font`} style={{
              fontSize: `${siteSettings.banners[0].titleFontSize}px`,
              color: 'white',
              fontWeight: 'bold'
            }}>
              {siteSettings.banners[0].title}
            </p>
            <p className={`roboto-font`} style={{
              fontSize: `${siteSettings.banners[0].textFontSize}px`,
              color: 'white',
              fontWeight: 'normal'
            }}>
              {siteSettings.banners[0].text || "Serving the community for over 80 years delivering the highest quality care and products for our customers"}
            </p>
            <br></br>
            <button
              className="px-8 py-3 bg-primary text-white font-semibold rounded-md hover:bg-white hover:text-primary hover:border-primary border-2 border-transparent transition-all"
            >
              <Link href={siteSettings.banners[0].buttonLink || "/#booking"}>{siteSettings.banners[0].buttonText || "Make A Booking"}</Link>
            </button>
          </div>
        </div>
      )}
      {siteSettings.show_counters_panel && <CounterPage />}
      {siteSettings.show_custom_panel && <CustomPanelPage />}
      <AboutPage />
      {siteSettings.show_youtube_panel && <YouTubePanelPage />}
      <ServicesPage />
      {siteSettings.show_socials_panel && <ConnectWithUsPage />}
      {siteSettings.show_teams_panel && <TeamPage />}
      <RecentBlogs />
      <BrandsPage />
      <TestimonialsPage />
      <BookingPage />

      {/* WhatsApp Button with Speech Bubble */}
      {siteSettings.whatsapp_tel && (
        <div className="fixed bottom-8 right-8 flex items-center gap-2 z-50 group">
          <div className="bg-white text-green-600 text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            WhatsApp Us
            <div className="absolute right-0 top-1/2 w-3 h-3 bg-white transform -translate-y-1/2 translate-x-1/2 rotate-45"></div>
          </div>
          <a
            href={`https://wa.me/${siteSettings.whatsapp_tel}?text=Hi%20there%2C%0A%0AI%20am%20sending%20you%20a%20request%20from%20the%20LuminaBlue%20website.%20My%20request%20as%20follows%3A%0A`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
            aria-label="Chat on WhatsApp"
          >
            <FaWhatsapp className="text-3xl" />
          </a>
        </div>
      )}
    </div>
  );
}