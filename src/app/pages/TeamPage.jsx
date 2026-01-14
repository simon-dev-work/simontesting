"use client";

import React, { useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useSiteSettings } from '../context/SiteSettingsContext';
import Image from 'next/image';
import Loader from "../components/Loader";

const TeamPage = () => {
  const { siteSettings, isLoading, error } = useSiteSettings();
  const [selectedMember, setSelectedMember] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Get team members, remove duplicates, and ensure valid image sources
  const teamMembers = Array.from(
    new Map(
      (siteSettings?.member?.member || [])
        .filter(member => member) // Filter out any null/undefined members
        .map(member => ({
          ...member,
          // Ensure img is either a valid non-empty string or null
          img: member.img && typeof member.img === 'string' && member.img.trim() !== '' 
            ? member.img.trim() 
            : null
        }))
        .map(member => [member._id || member.name, member])
    ).values()
  );
  const memberCount = teamMembers.length;
  
  // Center cards if there's only 1 member
  const isSingleMember = memberCount === 1;

  const settings = {
    dots: false,
    infinite: memberCount > 1,
    speed: 500,
    slidesToShow: Math.min(3, Math.max(1, memberCount)),
    slidesToScroll: 1,
    autoplay: memberCount > 1,
    autoplaySpeed: 3000,
    centerMode: isSingleMember,
    centerPadding: '0',
    arrows: memberCount > 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  const openBioPanel = (member) => {
    setSelectedMember(member);
    setIsPanelOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeBioPanel = () => {
    setIsPanelOpen(false);
    document.body.style.overflow = 'auto';
    setTimeout(() => setSelectedMember(null), 300);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <section className="w-full bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center min-h-[300px]">
          <p className="text-red-600">Error loading team information</p>
        </div>
      </section>
    );
  }

  if (!siteSettings?.member?.member || siteSettings.member.member.length === 0) {
    return (
      <section className="w-full bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center min-h-[300px]">
          <p className="text-gray-600">No team members available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-16 relative" id="team">
      <div className="max-w-6xl mx-auto px-4">
        <div className={isSingleMember ? 'w-full max-w-md mx-auto' : 'w-full'}>
          <h1 className="text-3xl text-black font-bold text-center mb-5 pt-8">
            {siteSettings.team?.team_title || "Our Team"}
          </h1>
          <div className="w-20 h-1 bg-primary mx-auto mb-5"></div>
          <p className="text-xl font-roboto text-base text-[#333] leading-[1.7] text-center mb-12">
            {siteSettings.team?.description}
          </p>
        </div>
        <div className={`relative ${isSingleMember ? 'w-full max-w-md mx-auto' : memberCount <= 2 ? 'max-w-2xl mx-auto' : ''}`}>
          <Slider {...settings}>
          {teamMembers.map((member, index) => (
            <div key={index} className="p-4">
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col w-full max-w-[260px] mx-auto">
                <div className="relative h-64 flex-shrink-0">
                  {member?.img ? (
                    <Image
                      src={member.img}
                      alt={member?.name || 'Team Member'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl text-primary font-semibold mb-2">
                    {member?.name || 'Unknown'}
                  </h3>
                  <p className="text-gray-600 mb-4 min-h-[24px] leading-6">
                    {member?.qualification || '\u00A0'}
                  </p>
                  <div className="mt-auto">
                    <button
                      onClick={() => openBioPanel(member)}
                      className="w-full px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-white hover:text-primary hover:border-primary border-2 border-transparent transition-all"
                    >
                      VIEW BIO
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </Slider>
        </div>
      </div>

      {/* Bio Panel Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-[9999999] transition-opacity duration-300 ${isPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeBioPanel}
      ></div>

      {/* Bio Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-xl z-[9999999] transform transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {selectedMember && (
          <div className="h-full flex flex-col">
            {/* Header with full-width image */}
            <div className="relative w-full bg-gray-100" style={{ minHeight: '20rem' }}>
              <div className="absolute inset-0 flex items-center justify-center px-4">
                <div className="relative w-full h-full max-w-4xl mx-auto">
                  {selectedMember?.img ? (
                    <Image
                      src={selectedMember.img}
                      alt={selectedMember.name || 'Team Member'}
                      fill
                      className="object-contain"
                      sizes="(max-width: 800px) 100vw, 50vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image Available</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={closeBioPanel}
                className="absolute top-4 right-4 bg-primary rounded-full w-10 h-10 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-colors shadow-md z-10"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
              {/* Full-width header */}
              <div className="w-full bg-gray-900 text-white p-6">
                <h2 className="text-2xl font-bold text-center sm:text-left">
                  Meet {selectedMember.name || 'Our Team Member'}
                </h2>
              </div>
              
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose max-w-none">
                  <p className="greyText  mb-12 max-w-5xl mx-auto">
                    {selectedMember.description || 'No bio available for this team member.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamPage;

// Add custom styles for centered slides
const styles = `
  .center-slides .slick-slide {
    display: flex !important;
    justify-content: center;
  }
  
  .center-slides .slick-track {
    display: flex;
    justify-content: center;
    width: 100% !important;
  }
  
  .center-slides .slick-slide > div {
    width: 100%;
    max-width: 320px; /* Match your card width */
  }
  
  /* Ensure consistent card width */
  .slick-slide > div {
    padding: 0 8px; /* Add some spacing between cards */
  }
  
  .slick-slide > div > div {
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
  }
`;

// Inject styles into the head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}