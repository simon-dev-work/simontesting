"use client";

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import SinglePageNavbar from '../../components/SinglePageNavbar';
import SinglePageFooter from '../../components/SinglePageFooter';
import { SiteSettingsProvider, useSiteSettings } from '../../context/SiteSettingsContext';
import { getPracticeLogo } from '../../../utils/practiceUtils';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { usePractitioners } from '../../../hooks/usePractitioners';
import { useAvailableSlots } from '../../../hooks/useAvailableSlots';
import Loader from '../../components/Loader';

const INFO_CENTRE_BANNER =
  'https://www.imageeyecareoptometrists.com/assets/info_centre_banner-4940284541b3ff321b2a3d735fc5ef1caa0f4c66de9804905118656edf31c88d.jpg';

const titleize = (value = '') =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const buildBookingContext = (practiceId, overrides = {}) => {
  const {
    actionVerb = 'book',
    practiceInfo = {},
    patientInfo = null,
    appointment = null,
    practiceUseEcpBooking = false,
    practiceWorkingDays = [],
    practiceMapUrl = '',
  } = overrides;

  let patientName = '';
  let patientEmail = '';
  let patientMobile = '';
  let practitionerId = '';
  let readOnly = '';
  let existingApptCss = '';
  let appointmentOldTime = '';

  if (patientInfo) {
    patientName = patientInfo.name ?? '';
    patientEmail = patientInfo.personal_infos?.[0]?.email ?? '';
    patientMobile = patientInfo.personal_infos?.[0]?.phone_number ?? '';
  }

  if (appointment) {
    patientName = appointment.patient_name ?? patientName;
    patientEmail = appointment.patient_email ?? patientEmail;
    patientMobile = appointment.patient_mobile ?? patientMobile;
    appointmentOldTime = appointment.start_time ?? '';
    practitionerId = appointment.practitioner_id ?? '';
    readOnly = 'disabled';
    existingApptCss = 'hidden';
  }

  return {
    practiceId,
    actionVerb,
    actionVerbTitle: titleize(actionVerb),
    practiceInfo,
    practiceUseEcpBooking,
    practiceWorkingDays,
    practiceMapUrl,
    patientName,
    patientEmail,
    patientMobile,
    practitionerId,
    appointmentOldTime,
    readOnly,
    existingApptCss,
  };
};

const AddressLines = ({ value }) => {
  const lines = (value || '').split(',').map((segment) => segment.trim()).filter(Boolean);
  if (!lines.length) return <span />;
  return (
    <span>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`}>
          {line}
          {index < lines.length - 1 && <br />}
        </span>
      ))}
    </span>
  );
};

const WorkingHours = ({ ranges = [] }) => {
  if (!ranges.length) {
    return <span>N/A</span>;
  }

  return (
    <ul>
      {ranges.map((range, index) => (
        <li key={`${range.desc}-${index}`}>
          <span style={{ display: 'block', fontWeight: 500 }}>{range.desc}</span>
          <span>{range.hours}</span>
        </li>
      ))}
    </ul>
  );
};

const PractitionerSelect = ({ practiceInfo, readOnly, practitionerId }) => {
  const optometrists = practiceInfo.optometrists ?? [];
  if (!optometrists.length) return null;

  if (optometrists.length === 1) {
    return <input type="hidden" name="practitioner_id" id="practitioner_id" value={optometrists[0].id ?? ''} />;
  }

  return (
    <select id="practitioner_id" name="practitioner_id" className="form-control new_theme_select" disabled={Boolean(readOnly)}>
      <option disabled value="">
        Select Practitioner
      </option>
      {optometrists
        .filter((optom) => !optom.hide_from_online_calendar)
        .map((optom) => (
          <option key={optom.id} value={optom.id} selected={practitionerId && optom.id === practitionerId}>
            {optom.name}
          </option>
        ))}
    </select>
  );
};

const formatTradingHours = (hoursString) => {
  if (!hoursString || typeof hoursString !== 'string') return [];

  const dayMap = {
    '0': 'Monday',
    '1': 'Tuesday',
    '2': 'Wednesday',
    '3': 'Thursday',
    '4': 'Friday',
    '5': 'Saturday',
    '6': 'Sunday',
    '7': 'Public Holidays',
  };

  // Parse the hours string and group consecutive days with same hours
  const hoursEntries = hoursString.split(';').filter(Boolean);
  const groupedHours = [];
  let currentGroup = null;

  hoursEntries.forEach(entry => {
    const [days, start, end] = entry.split('-');
    if (!days || !start || !end) return;

    const dayNumbers = days.split('|');
    const dayNames = dayNumbers.map(day => dayMap[day] || day);
    
    const timeString = `${start} - ${end}`;
    
    // Check if we can group with previous
    if (currentGroup && currentGroup.time === timeString) {
      currentGroup.days = [...currentGroup.days, ...dayNames];
    } else {
      if (currentGroup) groupedHours.push(currentGroup);
      currentGroup = {
        days: [...dayNames],
        time: timeString
      };
    }
  });

  // Add the last group
  if (currentGroup) {
    groupedHours.push(currentGroup);
  }

  // Format day ranges for display
  const formatDayRange = (days) => {
    // Sort days in correct order
    const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedDays = days.sort((a, b) => orderedDays.indexOf(a) - orderedDays.indexOf(b));
    
    // Check for weekdays (Mon-Fri)
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    if (sortedDays.every(day => weekdays.includes(day)) && sortedDays.length === 5) {
      return 'Monday - Friday';
    }
    // Check for Mon-Thu
    const weekdaysMinusFriday = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    if (sortedDays.every(day => weekdaysMinusFriday.includes(day)) && sortedDays.length === 4) {
      return 'Monday - Thursday';
    }
    // For other cases, list all days
    return sortedDays.join(', ');
  };

  return groupedHours.map(group => ({
    days: formatDayRange(group.days),
    time: group.time
  }));
};

const BookingForm = ({ ctx, logoLight, logoDark }) => {
  const {
    actionVerb,
    actionVerbTitle,
    practiceInfo,
    practiceUseEcpBooking,
    practiceWorkingDays,
    practiceMapUrl,
    patientName,
    patientEmail,
    patientMobile,
    readOnly,
    existingApptCss,
  } = ctx;

  const { siteSettings, isLoading, error } = useSiteSettings();
  const practiceAddress = siteSettings?.address_1 || practiceInfo.address_1 || '';
  const practiceLocation = siteSettings?.city
    ? `${siteSettings.city}${practiceInfo.address_1 ? ', ' : ''}${practiceInfo.address_1 || ''}`
    : practiceInfo.location;
  const practiceEmail = siteSettings?.email || practiceInfo.email || '';
  const practicePhone = siteSettings?.tel || siteSettings?.phone || practiceInfo.tel || '';
  const tradingHours = useMemo(() => formatTradingHours(siteSettings?.hours), [siteSettings?.hours]);
  const [formData, setFormData] = useState({
    name: patientName,
    email: patientEmail,
    mobile: patientMobile,
    comments: '',
    date: '',
    timeSlot: '',
    practitioner: '',
    appt_type: ''
  });
  
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [practitioners, setPractitioners] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);
  const [practiceData, setPracticeData] = useState(null);
  const [slotError, setSlotError] = useState(null);

  const displayErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  // Use the practitioners hook
  const { 
    data: practitionersData, 
    isLoading: isPractitionersLoading, 
    error: practitionersError 
  } = usePractitioners(ctx.practiceId);

  // Process practitioners data when it loads
  useEffect(() => {
    if (practitionersData) {
      const mappedPractitioners = practitionersData.map(opt => {
        const availability = {
          closedDays: [],
          unavailableSlots: []
        };

        if (opt.calendar_time_slots_unavailable) {
          const rules = opt.calendar_time_slots_unavailable.split(';');
          
          rules.forEach(rule => {
            if (rule.endsWith('-Closed')) {
              const day = parseInt(rule.split('-')[0]);
              if (!isNaN(day)) {
                availability.closedDays.push(day);
              }
            }
            else if (rule.includes('-') && rule.includes('|')) {
              const [days, times] = rule.split('-');
              const [startTime, endTime] = times.split('-');
              const dayList = days.split('|').map(Number);
              
              dayList.forEach(day => {
                availability.unavailableSlots.push({
                  day,
                  startTime,
                  endTime 
                });
              });
            }
          });
        }

        return {
          value: opt.id,
          label: `${opt.name} ${opt.surname}`,
          qualification: opt.qualification,
          availability,
          calendar_time_slots_unavailable: opt.calendar_time_slots_unavailable
        };
      });
      
      setPractitioners(mappedPractitioners);
    }
  }, [practitionersData]);
  
  // Cleanup function for the component
  useEffect(() => {
    return () => {
      // Cleanup any resources if needed
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePractitionerChange = (e) => {
    const practitionerId = e.target.value;
    const selected = practitioners.find(p => p.value.toString() === practitionerId);
    setSelectedPractitioner(selected);
    setFormData(prev => ({ ...prev, practitioner: practitionerId }));
  };

  // Use the available slots hook
  const { 
    data: availableSlotsData, 
    isLoading: isLoadingSlots, 
    error: slotsError 
  } = useAvailableSlots(
    ctx.practiceId, 
    formData.practitioner, 
    formData.date
  );

  // Process available slots when they change
  useEffect(() => {
    if (!formData.date || !formData.practitioner) {
      setAvailableSlots([]);
      return;
    }

    if (slotsError) {
      console.error('Error fetching available slots:', slotsError);
      setSlotError('Failed to load available time slots. Please try again.');
      setAvailableSlots([]);
      return;
    }

    if (!availableSlotsData) {
      setAvailableSlots([]);
      return;
    }

    const selectedDate = new Date(formData.date);
    const dayOfWeek = selectedDate.getDay() - 1; // Convert to 0-6 (Mon-Sun) format
    const selectedPractitioner = practitioners.find(p => p.value === formData.practitioner);
    
    // Check if the day is marked as closed
    if (selectedPractitioner?.availability?.closedDays?.includes(dayOfWeek)) {
      setAvailableSlots([]);
      setSlotError('No availability on this day');
      return;
    }

    // Process unavailable slots
    const unavailableSlots = [];
    if (selectedPractitioner?.availability?.unavailableSlots) {
      const todayUnavailable = selectedPractitioner.availability.unavailableSlots
        .filter(slot => slot.day === dayOfWeek)
        .map(({ startTime, endTime }) => ({
          startTime,
          endTime,
          allDay: false
        }));
      
      unavailableSlots.push(...todayUnavailable);
    }

    // Filter and process slots
    const filteredSlots = availableSlotsData.map(slot => {
      if (!slot.available) {
        return {
          ...slot,
          available: false
        };
      }
      
      const isAvailable = !unavailableSlots.some(unavailable => {
        if (unavailable.allDay) return true;
        
        const slotTime = slot.time;
        return (
          slotTime >= unavailable.startTime && 
          slotTime < unavailable.endTime
        );
      });
      
      return {
        ...slot,
        available: isAvailable
      };
    });
    
    setAvailableSlots(filteredSlots);
    setSlotError(null);
  }, [availableSlotsData, slotsError, formData.date, formData.practitioner, practitioners]);

  const handleTimeSlotSelect = (timeSlot) => {
    setFormData({ ...formData, timeSlot });
  };

  const handleRequestCall = async () => {
    if (!formData.name || !formData.mobile) {
      displayErrorMessage('Please provide the following:\nName &\nContact Number');
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('appointment[action]', 'call');
      formDataToSend.append('appointment[appt_type]', 'appointment');
      formDataToSend.append('appointment[name]', formData.name);
      formDataToSend.append('appointment[email]', formData.email || '');
      formDataToSend.append('appointment[cell]', formData.mobile);
      formDataToSend.append('appointment[notes]', formData.comments || '');
      formDataToSend.append('appointment[date]', '');
      formDataToSend.append('appointment[request_timezone]', Intl.DateTimeFormat().resolvedOptions().timeZone);
      formDataToSend.append('appointment[start_time]', '');
      formDataToSend.append('appointment[end_time]', '');
      formDataToSend.append('appointment[practitioner_id]', '');
      formDataToSend.append('appointment[status]', 'requested');
      formDataToSend.append('appointment[source]', 'lumina');

      formDataToSend.append('practice[id]', ctx.practiceId);
      formDataToSend.append('practice[name]', practiceInfo?.name || 'Image Eye Care');
      formDataToSend.append('practice[email]', practiceEmail || 'support@nevadacloud.com');

      const response = await axios.post(
        'https://eyecareportal.herokuapp.com/api/request_call_appointment/',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.data.status === 'created') {
        setShowSuccessModal(true);
      } else {
        throw new Error('Failed to request call');
      }
    } catch (error) {
      console.error('Error requesting call:', error);
      displayErrorMessage('There was an error processing your request. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (actionVerb === 'book' && (!formData.timeSlot || !formData.date || !formData.practitioner)) {
      displayErrorMessage('Please fill in all required fields and select a time slot');
      return;
    }
    
    if (actionVerb === 'request' && (!formData.name || !formData.mobile)) {
      displayErrorMessage('Please provide your name and contact number');
      return;
    }
    
    try {
      let phoneNumber = formData.mobile;

      if (phoneNumber && !phoneNumber.startsWith('+')) {
        const digits = phoneNumber.replace(/\D/g, '');
        if (digits.startsWith('0')) {
          phoneNumber = `+27${digits.substring(1)}`;
        } else if (digits.length > 0) {
          phoneNumber = `+27${digits}`;
        }
      }

      let startTime = '';
      let endTime = '';
      let timezoneOffset = 0;
      let timezoneString = '+00:00';
      
      if (actionVerb === 'book' && formData.timeSlot) {
        const appointmentDate = new Date(formData.date);
        const [hours, minutes] = formData.timeSlot.split(':');
        startTime = new Date(appointmentDate);
        startTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);
        startTime = startTime.toISOString();
        endTime = endTime.toISOString();
        
        timezoneOffset = -new Date(startTime).getTimezoneOffset() / 60;
        timezoneString = `${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset.toString().padStart(2, '0')}:00`;
      } else {
        const now = new Date();
        timezoneOffset = -now.getTimezoneOffset() / 60;
        timezoneString = `${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset.toString().padStart(2, '0')}:00`;
      }
      
      const selectedPractitioner = practitioners.find(p => p.value.toString() === formData.practitioner);
      
      const formDataToSend = new FormData();
      
      formDataToSend.append('appointment[action]', actionVerb);
      formDataToSend.append('appointment[appt_type]', formData.appt_type || 'consult');
      formDataToSend.append('appointment[name]', formData.name);
      formDataToSend.append('appointment[email]', formData.email);
      formDataToSend.append('appointment[cell]', phoneNumber);
      formDataToSend.append('appointment[notes]', formData.comments || '');
      formDataToSend.append('appointment[date]', formData.date);
      formDataToSend.append('appointment[request_timezone]', timezoneString);
      formDataToSend.append('appointment[start_time]', startTime);
      formDataToSend.append('appointment[end_time]', endTime);
      formDataToSend.append('appointment[practitioner_id]', actionVerb === 'book' ? formData.practitioner : '');
      formDataToSend.append('appointment[status]', 'requested');
      formDataToSend.append('appointment[source]', 'lumina');

      formDataToSend.append('practice[id]', ctx.practiceId);
      formDataToSend.append('practice[name]', practiceInfo?.name || 'Image Eye Care');
      formDataToSend.append('practice[email]', practiceEmail || 'support@nevadacloud.com');

      const response = await axios.post(
        'https://eyecareportal.herokuapp.com/api/book_appointment/',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.data.status === 'created') {
        setShowSuccessMessage(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          mobile: '',
          comments: '',
          date: '',
          appt_type: '',
          practitioner: '',
          timeSlot: ''
        });
        setAvailableSlots([]);
      } else {
        throw new Error('Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      displayErrorMessage('There was an error booking your appointment. Please try again.');
    }
  };

  // Success Modal Component
  const SuccessModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-6">
            Thank you for reaching out to us.<br />
            Our practice staff will contact you to arrange a booking.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const bannerImg = practiceInfo?.banner || practiceInfo?.hero_image || practiceInfo?.practice_banner || INFO_CENTRE_BANNER;

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded border border-gray-300">
          <p className="text-red-600">Error loading booking page</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--primary-color, #f3f5f7)' }}>
        <SinglePageNavbar practiceId={ctx.practiceId} logoLight={logoLight} logoDark={logoDark} />
        <div 
          className="w-full h-[clamp(380px,55vh,520px)] relative flex items-center justify-center text-white text-center"
          style={{
            background: bannerImg ? `url(${bannerImg}) center/cover` : '#dbeafe'
          }}
        >
          <div className="absolute inset-0 bg-slate-900/45"></div>
          <div className="relative z-10 max-w-4xl px-4">
            <h1 className="text-[clamp(2rem,4vw,3rem)] mb-3">{practiceData?.name || practiceInfo?.name || ''} Online Booking Page</h1>            
          </div>
        </div>
        <main className="flex-1 py-16 px-6 lg:py-16 lg:px-6 flex items-center justify-center relative">
          {/* Success Modal */}
          {showSuccessModal && (
            <SuccessModal onClose={() => setShowSuccessModal(false)} />
          )}
          <div className="w-full max-w-7xl relative rounded-3xl p-[clamp(2rem,4vw,3.5rem)] lg:p-[clamp(2rem,4vw,3.5rem)] bg-white shadow-2xl" data-practice-id={ctx.practiceId}>
            <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-[clamp(1.5rem,4vw,3.5rem)]">
              <div className="bg-gray-50 rounded-2xl p-6 lg:p-8 border border-gray-200 text-gray-800" id="contact">
                <div className="h-48 lg:h-60 rounded-xl overflow-hidden mb-6 border border-gray-200">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(practiceAddress || practiceLocation || '')}&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Practice location map"
                    className="w-full h-full border-0"
                  />
                </div>
                <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Physical Address</h5>
                <ul className="mb-5">
                  <li className="mb-1 text-base">{practiceLocation ?? ''}</li>
                  <li className="mb-1 text-base">
                    <AddressLines value={practiceAddress} />
                  </li>
                </ul>
                <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Trading Hours</h5>
                <ul className="mb-5">
                  {tradingHours.length ? (
                    tradingHours.map((entry, index) => (
                      <li key={`${entry.days}-${index}`} className="flex justify-between items-center mb-3 text-base">
                        <span className="pr-4">{entry.days}</span>
                        <span>{entry.time}</span>
                      </li>
                    ))
                  ) : practiceWorkingDays.length ? (
                    <li className="mb-3"><WorkingHours ranges={practiceWorkingDays} /></li>
                  ) : (
                    <li className="mb-3">Trading hours unavailable</li>
                  )}
                </ul>
                <h5 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Contact Details</h5>
                <ul>
                  <li className="mb-1 text-base">{practiceEmail}</li>
                  <li className="mb-1 text-base">{practicePhone}</li>
                </ul>
              </div>
              <div className="form-card">
                <h3 className="text-[clamp(2.2rem,4vw,2.8rem)] lg:text-[clamp(2.2rem,4vw,2.8rem)] font-bold mb-5 lg:mb-5">
                  <span className="text-cyan-500" style={{ color: 'var(--primary-color, #00bcd4)' }}>
                    {actionVerbTitle}
                  </span>{' '}
                  <span className="text-gray-900">Your Appointment</span>
                </h3>
                <form id="booking_form" name="booking_form" onSubmit={handleSubmit}>
                  <input type="hidden" name="action_type" value={actionVerb} />
                  {actionVerb === 'reschedule' ? (
                    <input type="hidden" id="appt_type" name="appt_type" value="consult" />
                  ) : (
                    <div className="mb-4">
                      <select id="appt_type" name="appt_type" value={formData.appt_type} onChange={handleInputChange} disabled={Boolean(readOnly)} className="w-full rounded-xl border border-gray-300 p-[0.9rem_1rem] text-base bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15">
                        <option disabled value="">
                          Select appointment type
                        </option>
                        <option value="consult">Full examination</option>
                        <option value="drivers">Driver&apos;s screening</option>
                      </select>
                    </div>
                  )}
                  <div className="mb-4">
                    <input type="text" name="name" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={Boolean(readOnly)} className="text--capitalize w-full rounded-xl border border-gray-300 p-[0.9rem_1rem] text-base bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15" />
                  </div>
                  <div className={`mb-4 ${existingApptCss}`}>
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={Boolean(readOnly)} className="w-full rounded-xl border border-gray-300 p-[0.9rem_1rem] text-base bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15" />
                  </div>
                  <div className={`mb-4 ${existingApptCss}`}>
                    <div className="relative">
                      <PhoneInput
                        international
                        defaultCountry="ZA"
                        value={formData.mobile}
                        onChange={(value) => setFormData({ ...formData, mobile: value })}
                        className="w-full rounded-xl border border-gray-300 p-[0.9rem_1rem] text-base bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15"
                        placeholder="Contact Number"
                        disabled={Boolean(readOnly)}
                      />
                    </div>
                  </div>
                  <div className={`mb-4 ${existingApptCss}`}>
                    <textarea name="comments" placeholder="Additional Comments" rows={4} value={formData.comments} onChange={(e) => setFormData({...formData, comments: e.target.value})} disabled={Boolean(readOnly)} className="w-full rounded-xl border border-gray-300 p-[0.9rem_1rem] text-base bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15" />
                  </div>
                  
                  {actionVerb === 'book' && (
                    <div className="mb-4">
                      <div className="mb-4">
                        <select
                          id="practitioner"
                          name="practitioner"
                          value={formData.practitioner || ''}
                          onChange={handlePractitionerChange}
                          className="w-full rounded-xl border border-gray-300 p-[0.9rem_1rem] text-base bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15"
                          required
                          disabled={practitionersLoading || practitioners.length === 0}
                        >
                          <option value="" disabled>Select practitioner</option>
                          {practitioners.length > 0 ? (
                            practitioners.map(practitioner => (
                              <option key={practitioner.value} value={practitioner.value}>
                                {practitioner.label}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>No practitioners available</option>
                          )}
                        </select>
                        {practitionersLoading && <p className="mt-1 text-sm text-gray-500">Loading practitioners...</p>}
                        {!practitionersLoading && practitioners.length === 0 && !practitionersError && (
                          <p className="mt-1 text-sm text-yellow-600">No practitioners found for this practice</p>
                        )}
                        {practitionersError && <p className="mt-1 text-sm text-red-600">{practitionersError}</p>}
                      </div>

                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full mb-4 rounded-xl border border-gray-300 p-[0.9rem_1rem] text-base bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15"
                        required
                      />
                      
                      {formData.date && formData.practitioner && (
                        <div className="mt-4">
                          <h4 className="text-gray-700 font-medium mb-3 text-lg">Available Time Slots</h4>
                          {isLoadingSlots ? (
                            <p className="text-gray-600">Loading available slots...</p>
                          ) : slotError ? (
                            <p className="text-red-500">{slotError}</p>
                          ) : availableSlots.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {availableSlots.map((slot) => (
                                <button
                                  key={slot.time}
                                  type="button"
                                  onClick={() => slot.available && handleTimeSlotSelect(slot.time)}
                                  disabled={!slot.available}
                                  className={`p-3.5 border rounded-xl text-center transition-colors duration-200 ${
                                    slot.available
                                      ? formData.timeSlot === slot.time
                                        ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)] hover:bg-opacity-90'
                                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 hover:border-[var(--primary-color)]'
                                      : 'bg-gray-100 text-gray-700 border-gray-200 cursor-not-allowed opacity-70 hover:opacity-100'
                                  }`}
                                >
                                  {slot.time}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-600">No available slots for this date. Please select another date.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {actionVerb === 'request' && (
                    <div className="mb-4">
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-xl border border-gray-300 p-[0.9rem_1rem] text-base bg-gray-100 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15"
                      />
                    </div>
                  )}
                    {/* Success Message */}
                    {showSuccessMessage && (
                      <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        {actionVerb === 'book' ? 'Your appointment has been booked successfully!' : 'Your appointment has been requested successfully!'}
                      </div>
                    )}
                    
                    {showError && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{errorMessage}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-[0.85rem] mt-4 lg:mt-6">
                      <input id="booking_button" type="submit" className="border-none rounded-xl p-3.5 lg:p-4 font-semibold cursor-pointer uppercase tracking-[0.02em] bg-[var(--primary-color)] text-white shadow-lg shadow-cyan-500/30 text-sm lg:text-base" value={`${actionVerbTitle} Appointment`} />
                      <input id="booking_call_me" type="button" onClick={handleRequestCall} className="border-none rounded-xl p-3.5 lg:p-4 font-semibold cursor-pointer uppercase tracking-[0.02em] bg-gray-800 text-white text-sm lg:text-base" value="Request call" />
                    </div>
                </form>
              </div>
            </div>
          </div>
        </main>
        <SinglePageFooter
          practiceId={ctx.practiceId}
          logoLight={logoLight}
          logoDark={logoDark}
          className="mt-auto"
        />
      </div>
    </>
  );
};

export default function NewBookingPage() {
  const { practice_id } = useParams();
  const context = useMemo(() => buildBookingContext(practice_id), [practice_id]);
  const [logoLight, setLogoLight] = useState(null);
  const [logoDark, setLogoDark] = useState(null);
  const [practiceUseEcpBooking, setPracticeUseEcpBooking] = useState(false);
  const [actionVerb, setActionVerb] = useState('book');

  useEffect(() => {
    let isMounted = true;

    const loadPracticeAssets = async () => {
      if (!practice_id) return;

      let luminaLogoSet = false;

      try {
        const response = await fetch(`https://eyecareportal.herokuapp.com/api/website/${practice_id}/0`);
        if (response.ok) {
          const data = await response.json();
          const hasData = data && Object.keys(data).length > 0;
          if (hasData) {
            const light = data.about?.logo_light || data.about?.logo_dark || null;
            const dark = data.about?.logo_dark || data.about?.logo_light || null;
            if (isMounted) {
              setLogoLight(light);
              setLogoDark(dark);
            }
            luminaLogoSet = Boolean(light || dark);
          }
        }
      } catch (error) {
        console.error('[NewBooking] Error fetching Lumina practice data:', error);
      }

      try {
        const settings = await getPracticeSettings(practice_id);
        if (Array.isArray(settings) && settings.length) {
          const bookingSetting = settings.find((setting) => setting.setting_name === 'UseECPAppointmentBooking');
          if (bookingSetting && isMounted) {
            const useEcp = bookingSetting.setting_value === 't';
            setPracticeUseEcpBooking(useEcp);
            setActionVerb(useEcp ? 'book' : 'request');
          }

          if (!luminaLogoSet) {
            const logoUrl = getPracticeLogo(settings);
            if (logoUrl && isMounted) {
              setLogoLight(logoUrl);
              setLogoDark(logoUrl);
            }
          }
        }
      } catch (error) {
        console.error('[NewBooking] Error fetching practice logos:', error);
      }
    };

    loadPracticeAssets();

    return () => {
      isMounted = false;
    };
  }, [practice_id]);

  const derivedContext = useMemo(
    () => ({
      ...context,
      practiceUseEcpBooking,
      actionVerb,
      actionVerbTitle: titleize(actionVerb),
    }),
    [context, practiceUseEcpBooking, actionVerb],
  );

  return (
    <SiteSettingsProvider initialPracticeId={practice_id}>
      <BookingForm ctx={derivedContext} logoLight={logoLight} logoDark={logoDark} />
    </SiteSettingsProvider>
  );
}
