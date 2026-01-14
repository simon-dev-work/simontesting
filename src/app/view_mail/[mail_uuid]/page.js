'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { SiteSettingsProvider } from '../../context/SiteSettingsContext';
import { isLuminaPractice, getPracticeSettings, getPracticeLogo } from '../../../utils/practiceUtils';
import Loader from "../../components/Loader";

const SinglePageNavbar = dynamic(() => import('../../components/SinglePageNavbar'), { ssr: false });
const SinglePageFooter = dynamic(() => import('../../components/SinglePageFooter'), { ssr: false });
import Image from 'next/image';
import crypto from 'crypto';

function getApiKey() {
  const today = new Date().toISOString().split('T')[0];
  return crypto.createHash('md5').update(today).digest('hex');
}

export default function ViewMailLink({ params }) {
  const { mail_uuid } = React.use(params);
  const [mailData, setMailData] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('rgb(0, 120, 200)');
  const [practiceSettings, setPracticeSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [practiceInfo, setPracticeInfo] = useState({});
  const [siteSettings, setSiteSettings] = useState({});
  const [nevadaPracticeData, setNevadaPracticeData] = useState(null);
  const [practiceId, setPracticeId] = useState('67');
  const [practiceLogo, setPracticeLogo] = useState(null);
  const [logoState, setLogoState] = useState({ 
    logo_light: '', 
    logo_dark: '',
    isLoading: true,
    error: null
  });
  const [blogs, setBlogs] = useState([]);
  const [hasLuminaSite, setHasLuminaSite] = useState(false);
  const [practitionerData, setPractitionerData] = useState({
    profilePhotoUrl: '',
    defaultPractitionerId: null,
    name: '',
    surname: '',
    position: '',
    qualification: '',
    isLoading: false,
    error: null
  });
  
  // Fetch blogs from both practice-specific and general blog APIs
  const fetchAllBlogs = useCallback(async (practiceId) => {
    if (!practiceId) {
      return [];
    }
    
    try {
      // Fetch practice-specific blogs
      const practiceResponse = await fetch(
        `https://eyecareportal.herokuapp.com/api/blogs?practice_id=${practiceId}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
      
      // Fetch general blogs (without practice_id parameter)
      const generalResponse = await fetch(
        'https://eyecareportal.herokuapp.com/api/blogs',
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
      
      if (!practiceResponse.ok) {
        console.warn(`Practice blogs API returned ${practiceResponse.status}: ${practiceResponse.statusText}`);
      }
      
      if (!generalResponse.ok) {
        console.warn(`General blogs API returned ${generalResponse.status}: ${generalResponse.statusText}`);
      }
      
      // Process practice-specific blogs
      let practiceData = await practiceResponse.json();
      if (!Array.isArray(practiceData) && practiceData.blogs) {
        practiceData = practiceData.blogs;
      }
      const practiceBlogs = Array.isArray(practiceData) ? practiceData : [];
      
      // Process general blogs
      let generalData = await generalResponse.json();
      if (!Array.isArray(generalData) && generalData.blogs) {
        generalData = generalData.blogs;
      }
      const generalBlogs = Array.isArray(generalData) ? generalData : [];
      
      // Combine and deduplicate blogs by ID
      const allBlogsMap = new Map();
      
      // Add practice blogs first (they'll be overwritten by general blogs with same ID)
      practiceBlogs.forEach(blog => allBlogsMap.set(blog.id, blog));
      generalBlogs.forEach(blog => allBlogsMap.set(blog.id, blog));
      
      // Convert back to array, filter, sort and limit
      return Array.from(allBlogsMap.values())
        .filter(blog => blog?.date && blog.show !== false)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);
        
    } catch (error) {
      console.error('Error fetching blogs:', error);
      return [];
    }
  }, []);
  
  // Fetch blogs when practiceId changes
  useEffect(() => {
    const practiceId = mailData?.practice_id || siteSettings?.practiceId;
    
    if (practiceId) {
      fetchAllBlogs(practiceId).then(fetchedBlogs => {
        setBlogs(fetchedBlogs);
      }).catch(error => {
        console.error('Error fetching combined blogs:', error);
      });
    }
  }, [mailData?.practice_id, siteSettings?.practiceId, fetchAllBlogs]);
  
  // Fetch practice info including logos and contact details from APIs
  const fetchPracticeInfo = useCallback(async (practiceId) => {
    if (!practiceId) {
      return;
    }
    
    try {
      setLogoState(prev => ({ ...prev, isLoading: true }));
      
      // First, get the practice info from the eyecareportal API
      const apiUrl = `https://eyecareportal.herokuapp.com/api/website/${practiceId}/0`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response from API:', { status: response.status, data });
        throw new Error(`Failed to fetch practice data: ${response.status}`);
      }
      
      // Extract logo URLs from the API response with detailed logging
      const logo_light = data.about?.logo_light || 
                        data.logo_light || 
                        (data.website_settings && data.website_settings.logo_light) || 
                        (data.settings && data.settings.logo_light) || 
                        null;
                        
      const logo_dark = data.about?.logo_dark || 
                       data.logo_dark || 
                       (data.website_settings && data.website_settings.logo_dark) || 
                       (data.settings && data.settings.logo_dark) || 
                       null;
      
      // If we don't have logo URLs, try to construct them based on practice ID
      if (!logo_light || !logo_dark) {
        
        // Check if we can find any logo URLs in the response
        const findLogoUrl = (data, prefix = '') => {
          if (!data || typeof data !== 'object') return null;
          
          // Check for common logo URL patterns in the data
          for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string' && (value.includes('logo') || value.includes('Logo'))) {
              if (value.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
                return value;
              }
            } else if (typeof value === 'object' && value !== null) {
              const found = findLogoUrl(value, `${prefix}${key}.`);
              if (found) return found;
            }
          }
          return null;
        };
      }
      
      // Update the practice info state with the logo URLs
      setPracticeInfo(prev => ({
        ...prev,
        logo_light,
        logo_dark,
        isLoading: false,
        error: null
      }));
      
      // Also update the logo state
      setLogoState({
        logo_light,
        logo_dark,
        isLoading: false,
        error: null
      });
      
      // Fetch additional practice details from Nevada Cloud API for contact information
      const nevadaResponse = await fetch(`https://passport.nevadacloud.com/api/v1/public/practices/${practiceId}`);
      let contactInfo = { tel: '', email: '', address_1: '' };
      
      if (nevadaResponse.ok) {
        const nevadaData = await nevadaResponse.json();
        
        contactInfo = {
          tel: nevadaData?.tel || '',
          email: nevadaData?.email || '',
          address_1: nevadaData?.address_1 || ''
        };
      } else {
        console.error('Failed to fetch practice details from Nevada Cloud API, status:', nevadaResponse.status);
      }
      
      if (data) {
        // Update the practice info state with the fetched data
        setPracticeInfo(prev => ({
          ...prev,
          ...data,
          logo_light: logo_light,
          logo_dark: logo_dark,
          contact: contactInfo
        }));
        
        // Update the site settings with the contact info
        setSiteSettings(prev => ({
          ...prev,
          tel: contactInfo.tel,
          email: contactInfo.email,
          address_1: contactInfo.address_1
        }));
        
        // Also update the practice logo state with the light logo by default
        setPracticeLogo(logo_light);
      }
    } catch (error) {
      console.error('Error fetching practice info:', error);
      // Set default logos if API call fails
      setPracticeInfo(prev => ({
        ...prev,
        logo_light: '/default-logo-light.png',
        logo_dark: '/default-logo-dark.png'
      }));
    }
  }, []);
  
  // Default practice ID to use when none is provided
  const DEFAULT_PRACTICE_ID = '67';

  // Log when mailData changes
  useEffect(() => {
    if (mailData) {
      if (mailData.practice_id) {
        fetchPracticeInfo(mailData.practice_id);
      }
    }
  }, [mailData, fetchPracticeInfo]);

  // Create a provider value for SiteSettingsContext
  const siteSettingsValue = useMemo(() => {
    // Use practice settings if available, otherwise fall back to siteSettings
    const settings = practiceSettings || siteSettings || {};
    const practiceId = mailData?.practice_id || DEFAULT_PRACTICE_ID;
    
    // Get contact information from practice settings or mail data
    const contactInfo = settings.contact || {};
    
    // Create a complete settings object with all required fields
    const completeSettings = {
      // Basic practice info
      practiceId: practiceId,
      name: settings?.name || mailData?.practice?.name || 'Practice',
      
      // Logo settings - use practiceLogo from state if available
      logo_light: practiceLogo || settings?.logo_light || '/default-logo-light.png',
      logo_dark: practiceLogo || settings?.logo_dark || '/default-logo-dark.png',
      
      // Contact information - prioritize contact object, then direct settings, then mail data
      tel: contactInfo.phone || settings?.tel || mailData?.practice?.phone || '',
      phone: contactInfo.phone || settings?.phone || mailData?.practice?.phone || '',
      email: contactInfo.email || settings?.email || 'info@example.com',
      address_1: contactInfo.address || settings?.address_1 || mailData?.practice?.address_1 || '123 Main St',
      city: contactInfo.city || settings?.city || 'City',
      province: contactInfo.province || settings?.province || 'Province',
      country: contactInfo.country || settings?.country || 'South Africa',
      postal_code: contactInfo.postal_code || settings?.postal_code || '0000',
      
      // Social media links
      social_media: { 
        facebook: '#',
        instagram: '#',
        linkedin: '#',
        twitter: '#',
        ...settings?.social_media
      },
      
      // Working hours
      working_hours: {
        monday: '8:00 AM - 5:00 PM',
        tuesday: '8:00 AM - 5:00 PM',
        wednesday: '8:00 AM - 5:00 PM',
        thursday: '8:00 AM - 5:00 PM',
        friday: '8:00 AM - 4:00 PM',
        saturday: '8:00 AM - 1:00 PM',
        sunday: 'Closed',
        ...settings?.working_hours
      },
      
      // About section
      about: {
        logo_light: practiceLogo || settings?.logo_dark || '/default-logo-dark.png',
        logo_dark: practiceLogo || settings?.logo_dark || '/default-logo-dark.png',
        aboutText: settings?.aboutText || 'We are committed to providing the best eye care services.',
        ...settings?.about
      },
      
      // UI Settings
      primaryColor: primaryColor || 'rgb(0, 120, 200)',
      
      // Panel visibility - ensure these are always set
      show_counters_panel: true,
      show_custom_panel: true,
      show_socials_panel: true,
      show_teams_panel: true,
      show_youtube_panel: true,
      
      // Required by context
      isLoading: false,
      error: null,
      updateSettings: (newSettings) => {
        setSiteSettings(prev => ({
          ...prev,
          ...newSettings
        }));
      }
    };
    
    return {
      ...completeSettings,
    };
  }, [siteSettings, practiceSettings, mailData?.practice_id, mailData?.practice?.name, mailData?.practice?.phone, mailData?.practice?.address_1, practiceLogo, primaryColor]);

  // Format appointment time
  const formatAppointmentTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return `${dateStr}\n${timeStr}`;
  };

  // Fetch practice logo from eyecareportal API using practice ID from mail data
  useEffect(() => {
    const fetchPracticeLogo = async () => {
      if (!mailData?.practice_id) {
        return;
      }
      
      try {
        const practiceId = mailData.practice_id;
        const apiUrl = `https://eyecareportal.herokuapp.com/api/website/${practiceId}/0`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!response.ok) {
          console.error('[ViewMail] API error:', data);
          throw new Error(`Failed to fetch practice data: ${response.status}`);
        }
        
        // Extract the logo URLs from the API response
        const logo_light = data.logo_light || '';
        const logo_dark = data.logo_dark || '';
        
        // Update the state with the logo URLs
        setLogoState({
          logo_light,
          logo_dark,
          isLoading: false,
          error: null
        });
        
      } catch (error) {
        console.error('[ViewMail] Error fetching practice logo:', error);
        setLogoState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
      }
    };
  }, [mailData?.practice_id]);

  // Fetch practice info and update site settings when practice_id is available
  useEffect(() => {
    const fetchPracticeInfo = async () => {
      if (!mailData?.practice_id) return;
      
      try {
        // Fetch practice website data
        const response = await fetch(
          `https://eyecareportal.herokuapp.com/api/website/${mailData.practice_id}/0`,
          { cache: 'no-store' }
        );
        
        if (!response.ok) throw new Error('Failed to fetch practice info');
        
        const data = await response.json();
        
        if (!data) {
          throw new Error('No data returned from practice info API');
        }
        
        const logo_light = data.logo_light || data.logo || '/default-logo-light.png';
        const logo_dark = data.logo_dark || data.logo || '/default-logo-dark.png';
        
        // Update practice info with the fetched data
        setPracticeInfo({
          ...data,
          logo_light,
          logo_dark
        });
        
        const updatedSettings = {
          ...siteSettings,
          practiceId: mailData.practice_id,
          practiceName: data.name || 'Practice',
          name: data.name || 'Practice',
          logo_light,
          logo_dark,
          tel: data.tel || data.phone,
          email: data.email,
          address_1: data.address_1 || data.address,
          address_2: data.address_2 || '',
          city: data.city || '',
          province: data.province || '',
          postal_code: data.postal_code || '',
          country: data.country || 'South Africa',
          aboutText: data.about_text || '',
          social_media: data.social_media || {},
          working_hours: data.working_hours || {}
        };
      
        setSiteSettings(updatedSettings);
        
        if (logo_light) {
          setPracticeLogo(logo_light);
        }
        
      } catch (error) {
        console.error('Error fetching practice info:', error);
        setPracticeInfo(prev => ({
          ...prev,
          logo_light: '/default-logo-light.png',
          logo_dark: '/default-logo-dark.png'
        }));
      }
    };
    
    fetchPracticeInfo();
  }, [mailData?.practice_id]);

  useEffect(() => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow && primaryColor) {
      iframe.contentWindow.postMessage({
        type: 'SET_PRIMARY_COLOR',
        color: primaryColor
      }, '*');
    }
  }, [primaryColor, siteSettings]);

  // Fetch practitioner details when practiceId and practitioner_id are available
  useEffect(() => {
    const fetchPractitionerDetails = async () => {
      if (!mailData?.practice_id || !mailData?.practitioner_id) {
        console.log('Missing required data for practitioner fetch:', {
          practice_id: mailData?.practice_id,
          practitioner_id: mailData?.practitioner_id
        });
        return;
      }

      const practitionerId = mailData.practitioner_id;
      const practiceId = mailData.practice_id;

      try {
        setPractitionerData(prev => ({ ...prev, isLoading: true, error: null }));

        // First, try to get the practice data which includes the list of optometrists
        const practiceResponse = await fetch(
          `https://passport.nevadacloud.com/api/v1/public/practices/${practiceId}`,
          { cache: 'no-store' }
        );

        if (!practiceResponse.ok) {
          throw new Error(`Failed to fetch practice data: ${practiceResponse.status}`);
        }

        const practiceData = await practiceResponse.json();
        
        // Find the practitioner in the practice's optometrists list
        const practitioner = practiceData.optometrists?.find(
          opto => String(opto.id) === String(practitionerId)
        );

        if (!practitioner) {
          throw new Error(`Practitioner with ID ${practitionerId} not found in practice ${practiceId}`);
        }

        // Get the practitioner's settings for profile photo
        const settingsResponse = await fetch(
          `https://www.ocumail.com/api/settings?setting_object_id=${practitionerId}&setting_object_type=User&practice_id=${practiceId}`,
          { cache: 'no-store' }
        );

        let profilePhotoUrl = '';
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          const profilePhotoSetting = settings.find(
            s => s.setting_name === 'ProfilePhotoURL'
          );
          profilePhotoUrl = profilePhotoSetting?.setting_value || '';
        }

        // Update state with the practitioner data
        setPractitionerData({
          profilePhotoUrl: profilePhotoUrl,
          defaultPractitionerId: practitionerId,
          name: practitioner.name || '',
          surname: practitioner.surname || '',
          position: practitioner.position || '',
          qualification: practitioner.qualification || '',
          isLoading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching practitioner details:', error);
        setPractitionerData(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to load practitioner information'
        }));
      }
    };
    
    if (mailData?.practice_id && mailData?.practitioner_id) {
      fetchPractitionerDetails();
    }
  }, [mailData?.practice_id, mailData?.practitioner_id]);

  // Fetch primary color when mailData is available
  useEffect(() => {
    const fetchPrimaryColor = async () => {
      if (!mailData?.practice_id) return;
      
      try {
        const response = await fetch(
          `https://www.ocumail.com/api/settings?setting_object_id=${mailData.practice_id}&setting_object_type=Practice`,
          { cache: 'no-store' }
        );
        
        if (!response.ok) throw new Error('Failed to fetch color settings');
        
        const settings = await response.json();
        const primaryColorSetting = settings.find(s => s.setting_name === 'PrimaryColor');
        
        if (primaryColorSetting?.setting_value) {
          const color = primaryColorSetting.setting_value.trim();
          setPrimaryColor(color);
        }
      } catch (error) {
        console.error('Error fetching primary color:', error);
        setPrimaryColor('rgb(0, 120, 200)'); // Fallback color
      }
    };
    
    fetchPrimaryColor();
  }, [mailData?.practice_id]);

  // Fetch practice settings
  const fetchPracticeSettings = async (practiceId) => {
    if (!practiceId) return;
    
    try {
      // First check if this is a Lumina practice and get practice info
      const [isLumina, practiceInfo] = await Promise.all([
        isLuminaPractice(practiceId),
        // Fetch practice info from nevadacloud.com
        fetch(`https://passport.nevadacloud.com/api/v1/public/practices/${practiceId}`)
          .then(res => res.json())
          .catch((error) => {
            console.error('Error fetching practice info from nevadacloud:', error);
            return {}; // Return empty object if request fails
          })
       ]);
      
      setHasLuminaSite(isLumina);
      
      // Fetch practice settings from ocumail.com
      const settingsArray = await getPracticeSettings(practiceId);
      
      // Convert array of settings to an object for easier access
      const settings = settingsArray?.length > 0 ? settingsArray.reduce((acc, setting) => {
        acc[setting.setting_name] = setting.setting_value;
        return acc;
      }, {}) : {};
      
      setPracticeSettings(settings);
      
      // Get practice logo - prioritize the one from eyecareportal if available
      const logoUrl = practiceInfo?.logo_url || settings.PracticeLogoURL || null;
      
      if (logoUrl) {
        setPracticeLogo(logoUrl);
      }
      
      const updatedSettings = {
        ...settings,
        // Basic info
        practiceId: practiceId,
        name: practiceInfo?.name || settings.PracticeName || `Practice ${practiceId}`,
        
        // Contact info - prioritize existing siteSettings, then eyecareportal data
        tel: siteSettings.tel || practiceInfo?.tel || settings.PracticePhone || settings.tel || '',
        phone: siteSettings.phone || practiceInfo?.tel || settings.PracticePhone || settings.phone || '',
        email: siteSettings.email || practiceInfo?.email || settings.PracticeEmail || settings.email || 'info@example.com',
        address_1: siteSettings.address_1 || practiceInfo?.address_1 || settings.PracticeAddress1 || settings.address_1 || '123 Main St',
        city: siteSettings.city || practiceInfo?.city || settings.PracticeCity || settings.city || 'City',
        province: siteSettings.province || practiceInfo?.province || settings.PracticeProvince || settings.province || 'Province',
        country: practiceInfo?.country || settings.PracticeCountry || settings.country || 'South Africa',
        postal_code: practiceInfo?.postal_code || settings.PracticePostalCode || settings.postal_code || '0000',
        
        // Logo settings
        logo_light: logoUrl || '/default-logo-light.png',
        logo_dark: logoUrl || '/default-logo-dark.png',
        
        // Primary color for icons and other elements
        primaryColor: primaryColor,
        
        // Social media - use from eyecareportal if available, otherwise fall back to settings or defaults
        social_media: practiceInfo?.social_media || settings.social_media || {
          facebook: '#',
          instagram: '#',
          linkedin: '#',
          twitter: '#'
        },
        
        // Working hours - use from eyecareportal if available, otherwise fall back to settings or defaults
        working_hours: practiceInfo?.working_hours || settings.working_hours || {
          monday: '8:00 AM - 5:00 PM',
          tuesday: '8:00 AM - 5:00 PM',
          wednesday: '8:00 AM - 5:00 PM',
          thursday: '8:00 AM - 5:00 PM',
          friday: '8:00 AM - 4:00 PM',
          saturday: '8:00 AM - 1:00 PM',
          sunday: 'Closed'
        },
        
        // About section
        about: {
          logo_light: logoUrl || '/default-logo-dark.png',
          logo_dark: logoUrl || '/default-logo-dark.png',
          aboutText: practiceInfo?.about || settings.aboutText || 'We are committed to providing the best eye care services.'
        },
        
        // Theme
        primaryColor: practiceInfo?.primary_color || settings.primaryColor || 'rgb(0, 120, 200)'
      };
      
      setSiteSettings(updatedSettings);
      
    } catch (error) {
      console.error('Error fetching practice settings:', error);
    }
  };

  // Main data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch mail data
        const mailUrl = `https://www.ocumail.com/api/get_sent_mail/${mail_uuid}`;
        
        const mailResponse = await fetch(mailUrl, {
          cache: 'no-store'
        });
        
        if (!mailResponse.ok) {
          throw new Error(`Failed to fetch mail data: ${mailResponse.status}`);
        }
        
        const mailJson = await mailResponse.json();
        
        const mailItem = Array.isArray(mailJson) && mailJson.length > 0 ? mailJson[0] : mailJson;
        
        const practiceData = {
          id: mailItem.practice_id,
          name: mailItem.sender_name || 'Practice',
          phone: mailItem.mobile_num,
          logo_url: null
        };
        
        const processedMailData = {
          banner_url: mailItem.banner_url,
          practice: practiceData,
          patient_preferred_name: mailItem.patient_preferred_name,
          message_body: mailItem.message_body,
          practitioner_id: mailItem.practitioner_id, // Add practitioner_id to the mail data
          ...mailItem
        };
        
        setMailData(processedMailData);
        
        // Fetch practice details from Nevada Cloud API
        try {
          const nevadaResponse = await fetch(`https://passport.nevadacloud.com/api/v1/public/practices/${practiceData.id}`);
          
          if (nevadaResponse.ok) {
            const nevadaData = await nevadaResponse.json();
            
            // Store the full practice data from Nevada Cloud API
            setNevadaPracticeData(nevadaData);
            
            // Update site settings with the contact info
            setSiteSettings(prev => {
              const updatedSettings = {
                ...prev,
                tel: nevadaData.tel || '',
                email: nevadaData.email || '',
                address_1: nevadaData.address_1 || '',
                source: { ...nevadaData }
              };
              return updatedSettings;
            });
          } else {
            console.error('Failed to fetch practice details from Nevada Cloud API, status:', nevadaResponse.status);
          }
        } catch (error) {
          console.error('Error fetching practice details:', error);
        }
        
        // Fetch practice settings
        await fetchPracticeSettings(practiceData.id);
        
        // Fetch appointment data
        if (practiceData.id) {
          const apiKey = getApiKey();
          const appointmentUrl = `https://passport.nevadacloud.com/api/v1/public/appointments/${mail_uuid}?api_key=${apiKey}&practice_id=${practiceData.id}`;
          
          try {
            const response = await fetch(appointmentUrl);
            if (response.ok) {
              const appointmentData = await response.json();
              setAppointment(appointmentData);
            }
          } catch (err) {
            console.error('Error fetching appointment:', err);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.message || 'Failed to load data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [mail_uuid]);

  // Loading state
  if (loading) {
    return <Loader />;
  }
  
  // Error state
  if (error || !mailData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Content</h1>
          <p className="text-gray-700 mb-4">{error || 'Unable to load the requested data.'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { banner_url: bannerUrl, practice, patient_preferred_name: patientName, message_body: messageBody, section_items: sectionItems = [] } = mailData;

  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <script>
          // Listen for color updates from parent
          window.addEventListener('message', (event) => {
            if (event.data.type === 'SET_PRIMARY_COLOR') {
              document.documentElement.style.setProperty('--primary-color', event.data.color);
              // Update any buttons with the add-to-calendar class
              const buttons = document.querySelectorAll('.add-to-calendar');
              buttons.forEach(btn => {
                btn.style.backgroundColor = event.data.color;
              });
            }
          });
        </script>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: Arial, sans-serif;
            background: white;
            color: #333;
          }
          .banner-container {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            margin-bottom: 30px;
          }
          .banner-image {
            width: 100%;
            height: auto;
            display: block;
          }
          .content {
            padding: 0 40px 40px;
            max-width: 845px;
            margin: 0 auto;
          }
          .review-section {
            text-align: center;
            margin: 20px 0;
          }
          .review-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 5px;
            color: #1a1a1a;
          }
          .review-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
          }
          .message-container {
            text-align: left;
            margin: 30px 0;
            line-height: 1.6;
            color: #333;
          }
          .greeting {
            margin-bottom: 15px;
          }
          .message-body {
            white-space: pre-line;
            margin-bottom: 15px;
          }
          .appointment-panel {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            background-color: #f8fafc;
          }
          .appointment-title {
            margin-bottom: 10px;
            color: #1e293b;
          }
          .appointment-time {
            font-size: 28px;
            color: #334155;
            margin-bottom: 15px;
            font-weight: bold;
          }
          .add-to-calendar {
            display: inline-block;
            background-color: ${primaryColor || 'rgb(0, 120, 200)'};
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 14px;
            transition: background-color 0.2s;
            border: none;
            cursor: pointer;
          }
          .add-to-calendar:hover {
            background-color: ${primaryColor};
            opacity: 0.9;
          }
          
          /* Info Modules */
          .info-modules {
            margin: 40px 0;
          }
          
          .info-module {
            display: flex;
            margin-bottom: 30px;
            background: white;
            border: none;
            border-radius: 0;
            overflow: hidden;
          }
          
          .info-image {
            width: 200px;
            height: 200px;
            object-fit: cover;
            flex-shrink: 0;
            margin: 0;
            padding: 0;
            border: none;
          }
          
          .info-content {
            padding: 20px;
            flex-grow: 1;
          }
          
          .info-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #1a1a1a;
          }
          
          .info-body {
            margin: 0 0 15px 0;
            color: #4a5568;
            line-height: 1.5;
          }
          
          .read-more {
            display: inline-block;
            background-color: ${primaryColor};
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 14px;
            transition: background-color 0.2s;
          }
          
          .read-more:hover {
            background-color: ${primaryColor};
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="banner-container">
          <img src="${bannerUrl}" class="banner-image" alt="Banner" />
        </div>
        <div class="content">
          <div class="review-section">
            <h2 class="review-title">Rate and review</h2>
            <p class="review-subtitle">Share your experience to help others</p>
            
            <!-- Primary Rating Section -->
            ${nevadaPracticeData?.custom_rating_url && 
              nevadaPracticeData.custom_rating_logo && 
              nevadaPracticeData.custom_rating_logo.toLowerCase() !== 'none' ? `
              ${nevadaPracticeData.custom_rating_logo.toLowerCase() === 'stars' ? `
                <div class="stars-container" style="display: flex; justify-content: center; align-items: center; gap: 5px; margin: 15px 0; padding-top: 6px;">
                  ${[1, 2, 3, 4, 5].map(rating => `
                    <a 
                      href="/practice_review_link/${practice?.id || ''}/${rating}/${mail_uuid}" 
                      target="_blank" 
                      key="rating-${rating}"
                      style="display: inline-block;"
                    >
                      <img 
                        alt="${rating} stars" 
                        src="/images/stars${rating}.jpg"
                        width="40"
                        height="45"
                        border="0"
                      />
                    </a>
                  `).join('')}
                </div>
              ` : `
                <div style="text-align: center; margin: 20px 0;">
                  <a 
                    href="${nevadaPracticeData.custom_rating_url}" 
                    target="_blank"
                    style="display: inline-block;"
                  >
                    <img 
                      alt="${nevadaPracticeData.custom_rating_logo} Review" 
                      src="${nevadaPracticeData.custom_rating_logo.toLowerCase() === 'google' ? '/images/Google_review.jpg' : '/images/Facebook_review.jpg'}"
                      width="200"
                      style="display: block; margin: 0 auto;"
                    />
                  </a>
                </div>
              `}
            ` : ''}
            
            <!-- Alternate Rating Section -->
            ${nevadaPracticeData?.alt_custom_rating_url && 
              nevadaPracticeData.alt_custom_rating_logo && 
              nevadaPracticeData.alt_custom_rating_logo.toLowerCase() !== 'none' ? `
              ${nevadaPracticeData.alt_custom_rating_logo.toLowerCase() === 'stars' ? `
                <div class="stars-container" style="display: flex; justify-content: center; align-items: center; gap: 5px; margin: 15px 0; padding-top: 6px;">
                  ${[1, 2, 3, 4, 5].map(rating => `
                    <a 
                      href="/practice_review_link_alt/${practice?.id || ''}/${rating}/${mail_uuid}" 
                      target="_blank" 
                      key="alt-rating-${rating}"
                      style="display: inline-block;"
                    >
                      <img 
                        alt="${rating} stars" 
                        src="/images/stars${rating}.jpg"
                        width="40"
                        height="45"
                        border="0"
                      />
                    </a>
                  `).join('')}
                </div>
              ` : `
                <div style="text-align: center; margin: 20px 0;">
                  <a 
                    href="/practice_review_link_alt/${practice?.id || ''}/0/${mail_uuid}" 
                    target="_blank"
                    style="display: inline-block;"
                  >
                    <img 
                      alt="${nevadaPracticeData.alt_custom_rating_logo} Review" 
                      src="${nevadaPracticeData.alt_custom_rating_logo.toLowerCase() === 'google' ? '/images/Google_review.jpg' : '/images/Facebook_review.jpg'}"
                      width="200"
                      style="display: block; margin: 0 auto;"
                    />
                  </a>
                </div>
              `}
            ` : ''}
          </div>
          
          <div class="message-container">
            <p class="greeting">Dear ${patientName || 'Valued Patient'},</p>
            <div class="message-body">${messageBody || ''}</div>
            
            ${mailData.next_consultation_date ? `
              <div class="appointment-panel" style="display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <div>
                  <div style="color: #4a5568; margin-bottom: 8px;">Your next appointment is:</div>
                  <div style="font-size: 20px; font-weight: 600; color: #1a1a1a;">
                    ${new Date(mailData.next_consultation_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                  <div style="font-size: 16px; font-weight: 600; color: #1a1a1a;">
                    ${(() => {
                      const date = new Date(mailData.next_consultation_date);
                      const hours = date.getUTCHours();
                      const minutes = date.getUTCMinutes();
                      const ampm = hours >= 12 ? 'PM' : 'AM';
                      const displayHours = hours % 12 || 12;
                      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                    })()}
                  </div>
                </div>
                <a 
                  href="#w"
                  class="add-to-calendar"
                  onClick="event.preventDefault(); window.open('https://calendar.google.com/calendar/render?action=TEMPLATE&text=Appointment&dates=${new Date(mailData.next_consultation_date).toISOString().replace(/[^0-9]/g, '').substring(0, 15)}/${new Date(new Date(mailData.next_consultation_date).getTime() + 3600000).toISOString().replace(/[^0-9]/g, '').substring(0, 15)}', '_blank');"
                  style="background-color: ${primaryColor || 'rgb(0, 120, 200)'}; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; white-space: nowrap;"
                >
                  Add to calendar
                </a>
              </div>
            ` : ''}
            
            <!-- Practitioner Signature -->
            ${practitionerData.name ? `
              <div class="practitioner-signature" style="margin: 30px 0; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center;">
                  ${practitionerData.profilePhotoUrl ? `
                    <div style="margin-right: 15px;">
                      <img 
                        src="${practitionerData.profilePhotoUrl}" 
                        alt="${practitionerData.name} ${practitionerData.surname}" 
                        style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;"
                        onerror="this.onerror=null; this.src='/default-avatar.png';"
                        crossorigin="anonymous"
                      />
                      <!-- Debug info -->
                      <!-- 
                      <div style="font-size: 10px; color: #999; margin-top: 4px;">
                        Image URL: ${practitionerData.profilePhotoUrl}
                      </div>
                      -->
                    </div>
                  ` : ''}
                  <div>
                    <div style="display: flex; align-items: baseline; flex-wrap: wrap;">
                      <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">
                        ${practitionerData.name} ${practitionerData.surname}
                      </p>
                      ${practitionerData.qualification ? `
                        <span style="margin-left: 8px; font-size: 14px; color: #666666;">
                          ${practitionerData.qualification}
                        </span>
                      ` : ''}
                    </div>
                    ${practitionerData.position ? `
                      <p style="margin: 4px 0 0 0; font-size: 14px; color: #4a5568;">
                        ${practitionerData.position}
                      </p>
                    ` : ''}
                    ${mailData.practice_name ? `
                      <p style="margin: 4px 0 0 0; font-size: 14px; color: #4a5568; font-weight: 500;">
                        ${mailData.practice_name}
                      </p>
                    ` : ''}
                  </div>
                </div>
              </div>
            ` : ''}
            ${appointment?.start_time ? `
              <div class="appointment-panel">
                <div class="appointment-title">Your next appointment is:</div>
                <div class="appointment-time">${formatAppointmentTime(appointment.start_time)}</div>
                ${(() => {
                  const href = "/appointment_cal_file/" + (mailData?.practice_id || '') + "/" + (mailData?.mail_uuid || '');
                  return `
                    <a 
                      href="${href}" 
                      class="add-to-calendar"
                      style={{ backgroundColor: primaryColor }}
                    >
                  `;
                })()}
                  Add to Calendar
                </a>
              </div>
            ` : ''}
            
            ${sectionItems.length > 0 ? `
              <div class="info-modules">
                ${sectionItems.map(item => `
                  <div class="info-module">
                    <img src="${item.imgurl}" alt="${item.title}" class="info-image" />
                    <div class="info-content">
                      <h3 class="info-title">${item.title}</h3>
                      <p class="info-body">${item.body}</p>
                      <a href="/info_centre/view/${item.id}/${practice.id}" class="read-more">Read More</a>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </body>
    </html>
  `;

  // Get logo URLs from practiceInfo or use null if not available
  const getValidLogoUrl = (url) => {
    return url && typeof url === 'string' && url.trim() !== '' ? url : null;
  };

  const logoLight = getValidLogoUrl(practiceInfo?.logo_light);
  const logoDark = getValidLogoUrl(practiceInfo?.logo_dark);
  
  // If no logos are available, we'll pass null to prevent rendering broken images
  const finalLogoLight = logoLight || null;
  const finalLogoDark = logoDark || null;
  
  // Set a flag to indicate if we have any valid logo
  const hasValidLogo = !!(finalLogoLight || finalLogoDark);

  // Determine the practice ID to use
  const effectivePracticeId = mailData?.practice_id || siteSettings?.practiceId || '67';
  
  return (
    <SiteSettingsProvider initialPracticeId={effectivePracticeId}>
      <div className="flex flex-col min-h-screen">
        <SinglePageNavbar 
          practiceId={effectivePracticeId}
          logoLight={finalLogoLight}
          logoDark={finalLogoDark}
        />
        {/* Hero Section */}
        <div className="w-full h-[500px] bg-[url('https://www.imageeyecareoptometrists.com/assets/info_centre_banner-4940284541b3ff321b2a3d735fc5ef1caa0f4c66de9804905118656edf31c88d.jpg')] bg-cover bg-center text-white">
          <div className="h-full bg-black bg-opacity-50 flex items-center justify-center">
          </div>
        </div>
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="w-[845px] max-w-full bg-white rounded-t-lg shadow-lg" style={{ borderBottomLeftRadius: '0', borderBottomRightRadius: '0' }}>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: mailData.body }} />
                

            <div 
              className="w-full"
              dangerouslySetInnerHTML={{ __html: iframeContent }}
            />
          </div>
        </div>
        <SinglePageFooter
          practiceId={mailData?.practice_id || siteSettings?.practiceId || '67'}
          logoLight={finalLogoLight}
          logoDark={finalLogoDark}
        />
      </div>
    </SiteSettingsProvider>
  );
}
