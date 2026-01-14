"use client";

import { FaFacebook, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaWhatsapp, FaTiktok, FaGoogle, FaTwitter, FaPinterest } from 'react-icons/fa';
import { useSiteSettings } from "../context/SiteSettingsContext";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const SinglePageFooter = ({
  practiceId,
  logoLight,
  logoDark,
  primaryColor,
  className = ""
}) => {
  const { siteSettings } = useSiteSettings();
  const [licenseType, setLicenseType] = useState(null);
  const [hideLogo, setHideLogo] = useState(false);
  const [practiceDetails, setPracticeDetails] = useState({
    email: '',
    tel: '',
    address_1: '',
    city: '',
    postal_code: '',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    tiktok_url: '',
    whatsapp_tel: '',
    google_business_profile_url: '',
    twitter_url: '',
    pinterest_url: '',

  });

  // Fetch practice details from API
  useEffect(() => {
    const fetchPracticeDetails = async () => {
      if (!practiceId) return;
      
      try {
        const response = await fetch(`https://passport.nevadacloud.com/api/v1/public/practices/${practiceId}`);
        if (response.ok) {
          const data = await response.json();
          setPracticeDetails({
            email: data.email || '',
            tel: data.tel || '',
            address_1: data.address_1 || '',
            city: data.city || '',
            postal_code: data.postal_code || '',
            facebook_url: data.facebook_url || '',
            instagram_url: data.instagram_url || '',
            linkedin_url: data.linkedin_url || '',
            tiktok_url: data.tiktok_url || '',
            whatsapp_tel: data.whatsapp_tel || '',
            google_business_profile_url: data.google_business_profile_url || '',
            twitter_url: data.twitter_url || '',
            pinterest_url: data.pinterest_url || ''
          });
        }
      } catch (error) {
        console.error('Error fetching practice details:', error);
      }
    };

    fetchPracticeDetails();
  }, [practiceId]);

  // Use props if provided, otherwise fall back to practiceDetails or siteSettings
  const email = practiceDetails.email || siteSettings?.email;
  const address = practiceDetails.address_1 || siteSettings?.address_1;
  const phone = practiceDetails.tel || siteSettings?.tel || siteSettings?.phone;
  const whatsapp_tel = practiceDetails.whatsapp_tel || siteSettings?.whatsapp_tel || siteSettings?.whatsapp_tel;
  const name = siteSettings?.name;
  const color = primaryColor || siteSettings?.primaryColor || '#000000';
  const logo = logoLight || siteSettings?.logo;

  useEffect(() => {
    async function checkLogoSetting() {
      if (!practiceId) return;

      try {
        const response = await fetch(
          `https://www.ocumail.com/api/settings?setting_object_id=${practiceId}&setting_object_type=Practice`
        );

        if (response.ok) {
          const settings = await response.json();
          const logoSetting = settings.find(s => s.setting_name === 'HidePracticeLogoOnEyecarePortal');
          if (logoSetting) {
            setHideLogo(logoSetting.setting_value === 't');
          }
        }
      } catch (error) {
        console.error('Error checking logo visibility setting:', error);
      }
    }

    checkLogoSetting();
  }, [practiceId]);

  // Fetch license info
  useEffect(() => {
    let isMounted = true;

    async function fetchLicense() {
      if (!practiceId) return;

      try {
        const response = await fetch(
          `https://www.ocumail.com/api/settings?setting_object_id=${practiceId}&setting_object_type=Practice`
        );

        if (response.ok) {
          const settings = await response.json();
          const licenseSetting = settings.find(s => s.setting_name === 'LicenseType');
          if (licenseSetting && isMounted) {
            setLicenseType(licenseSetting.setting_value);
          }
        }
      } catch (error) {
        console.error('Error fetching license type:', error);
      }
    }

    fetchLicense();

    return () => {
      isMounted = false;
    };
  }, [practiceId]);

  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-[#363636] text-white py-12 ${className}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Logo and Social Icons */}
          <div className="space-y-4">
            {!hideLogo && logo && (
              <div className="relative h-14 w-72">
                <Image
                  src={logo}
                  alt={name || "Practice Logo"}
                  fill
                  className="object-contain object-left"
                  priority
                /> 
              </div>
            )}
            <div className="flex space-x-4">
              {practiceDetails.facebook_url && (
                <a 
                  href={practiceDetails.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors" 
                  aria-label="Facebook"
                >
                  <FaFacebook size={20} />
                </a>
              )}
              {practiceDetails.instagram_url && (
                <a 
                  href={practiceDetails.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors" 
                  aria-label="Instagram"
                >
                  <FaInstagram size={20} />
                </a>
              )}
              {practiceDetails.linkedin_url && (
                <a 
                  href={practiceDetails.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors" 
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={20} />
                </a>
              )}
              {practiceDetails.tiktok_url && (
                <a 
                  href={practiceDetails.tiktok_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors" 
                  aria-label="TikTok"
                >
                  <FaTiktok size={20} />
                </a>
              )}
              {practiceDetails.whatsapp_tel && (
                <a 
                  href={`https://wa.me/${practiceDetails.whatsapp_tel.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors" 
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp size={20} />
                </a>
              )}
              {practiceDetails.google_business_profile_url && (
                <a 
                  href={practiceDetails.google_business_profile_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors" 
                  aria-label="Google Business Profile"
                >
                  <FaGoogle size={20} />
                </a>
              )}
              {practiceDetails.twitter_url && (
                <a 
                  href={practiceDetails.twitter_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors" 
                  aria-label="Twitter"
                >
                  <FaTwitter size={20} />
                </a>
              )}
              {practiceDetails.pinterest_url && (
                <a 
                  href={practiceDetails.pinterest_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors" 
                  aria-label="Pinterest"
                >
                  <FaPinterest size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="w-full md:w-auto">
            <h3 className="text-lg font-semibold mb-3 text-white">Contact Us</h3>
            <ul className="space-y-2">
              {(practiceDetails.address_1 || address) && (
                <li className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="mt-1 text-gray-400" />
                  <span className="text-gray-400">
                    {practiceDetails.address_1 || address}
                    {practiceDetails.city && `, ${practiceDetails.city}`}
                    {practiceDetails.postal_code && `, ${practiceDetails.postal_code}`}
                  </span>
                </li>
              )}
              {(practiceDetails.tel || phone) && (
                <li className="flex items-center space-x-3">
                  <FaPhone className="text-gray-400" />
                  <a 
                    href={`tel:${practiceDetails.tel || phone}`} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {practiceDetails.tel || phone}
                  </a>
                </li>
              )}
              {(practiceDetails.email || email) && (
                <li className="flex items-center space-x-3">
                  <FaEnvelope className="text-gray-400" />
                  <a 
                    href={`mailto:${practiceDetails.email || email}`} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {practiceDetails.email || email}
                  </a>
                </li>
              )} 
              {(practiceDetails.whatsapp_tel || whatsapp_tel) && (
                <li className="flex items-center space-x-3">
                  <FaWhatsapp className="text-gray-400" />
                  <a 
                    href={`https://wa.me/${(practiceDetails.whatsapp_tel || whatsapp_tel).replace(/\D/g, '')}`} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {practiceDetails.whatsapp_tel || whatsapp_tel}
                  </a>
                </li>
              )}              
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SinglePageFooter;
