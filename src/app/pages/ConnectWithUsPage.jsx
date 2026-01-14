"use client";

import { useState, useRef, useEffect } from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp, FaPinterest, FaTiktok, FaGoogle } from 'react-icons/fa';
import { useSiteSettings } from "../context/SiteSettingsContext";

const ConnectWithUsPage = ({ practiceId }) => {
  const { siteSettings } = useSiteSettings();

  return (
    <section className="relative w-full overflow-hidden py-24 text-center">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full parallax-bg"
          style={{
            backgroundImage: "url('/images/FramesBG2.png')",
            backgroundAttachment: 'fixed',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.9
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
      </div>

      <h2 className="text-5xl font-bold mb-5 text-white relative z-10 pt-8">
        Connect With Us
      </h2>
      <div className="w-10 h-1 bg-white mx-auto mb-5"></div>
      <p className="text-lg font-roboto text-white leading-[1.7] text-center mb-12 max-w-5xl mx-auto relative z-10">
        Immerse yourself in our vibrant online community by following us on platforms such as Facebook, Instagram, LinkedIn, WhatsApp, Pinterest, and more.
      </p>
      <div className="flex flex-wrap justify-center gap-8 relative z-10 pb-8 px-4">
      {siteSettings.facebook_url && siteSettings.facebook_url.trim() !== "" && (
        <a
          href={siteSettings.facebook_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-5xl text-primary hover:text-primary transition-transform duration-200 hover:scale-110"
        >
          <FaFacebook />
        </a>
      )}

      {typeof siteSettings.instagram_url === 'string' && siteSettings.instagram_url.trim() !== "" && (
        <a
          href={siteSettings.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-5xl text-primary hover:text-primary transition-transform duration-200 hover:scale-110"
        >
          <FaInstagram />
        </a>
      )}

      {typeof siteSettings.linkedin_url === 'string' && siteSettings.linkedin_url.trim() !== "" && (
        <a
          href={siteSettings.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-5xl text-primary hover:text-primary transition-transform duration-200 hover:scale-110"
        >
          <FaLinkedin />
        </a>
      )}

      {typeof siteSettings.whatsapp_tel === 'string' && siteSettings.whatsapp_tel.trim() !== "" && (
        <a
          href={`https://wa.me/${siteSettings.whatsapp_tel.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-5xl text-primary hover:text-primary transition-transform duration-200 hover:scale-110"
        >
          <FaWhatsapp />
        </a>
      )}

      {typeof siteSettings.pinterest_url === 'string' && siteSettings.pinterest_url.trim() !== "" && (
        <a
          href={siteSettings.pinterest_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-5xl text-primary hover:text-primary transition-transform duration-200 hover:scale-110"
        >
          <FaPinterest />
        </a>
      )}

      {typeof siteSettings.tiktok_url === 'string' && siteSettings.tiktok_url.trim() !== "" && (
        <a
          href={siteSettings.tiktok_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-5xl text-primary hover:text-primary transition-transform duration-200 hover:scale-110"
        >
          <FaTiktok />
        </a>
      )}

      {typeof siteSettings.google_business_profile_url === 'string' && siteSettings.google_business_profile_url.trim() !== "" && (
        <a
          href={siteSettings.google_business_profile_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-5xl text-primary hover:text-primary transition-transform duration-200 hover:scale-110"
        >
          <FaGoogle />
        </a>
      )}
      </div>
    </section>
  );
};

export default ConnectWithUsPage;
