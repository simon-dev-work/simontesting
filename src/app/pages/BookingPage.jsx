"use client";

import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useSiteSettings } from "../context/SiteSettingsContext";
import { useParams } from 'next/navigation';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { FaPhone, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);

const BookingPage = () => {
  const { siteSettings } = useSiteSettings();
  const [practitioners, setPractitioners] = useState([]);
  const [practiceInfo, setPracticeInfo] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showRequestCallModal, setShowRequestCallModal] = useState(false);
  const [actionVerb, setActionVerb] = useState('book');
  const [customBookingUrl, setCustomBookingUrl] = useState('');
  const [apiPracticeDetails, setApiPracticeDetails] = useState({ name: '', email: '' });
  const practiceId = siteSettings?.practiceId;
  const actionVerbTitle = capitalize(actionVerb);

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

  useEffect(() => {
    if (!practiceId) {
      throw new Error('No practiceId available');
    }

    const fetchBookingSetting = async () => {
      try {
        const response = await axios.get(`https://www.ocumail.com/api/settings?setting_object_id=${practiceId}&setting_object_type=Practice`);
        if (Array.isArray(response.data)) {
          const bookingSetting = response.data.find((setting) => setting.setting_name === 'UseECPAppointmentBooking');
          if (bookingSetting) {
            setActionVerb(bookingSetting.setting_value === 't' ? 'book' : 'request');
          }
        }
      } catch (fetchError) {
        console.error('Error fetching booking setting:', fetchError);
      }
    };

    fetchBookingSetting();

    const fetchPractitioners = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://passport.nevadacloud.com/api/v1/public/practices/${practiceId}`);
        // store practice name and email for later form submission
        setPracticeInfo({ name: response.data.name || '', email: response.data.email || '' });
        
        if (!response.data || !Array.isArray(response.data.optometrists)) {
          setError('No practitioners found for this practice');
          return;
        }

        // Check for custom_booking_url
        if (response.data.custom_booking_url) {
          setCustomBookingUrl(response.data.custom_booking_url);
        }

        if (response.data) {
          setApiPracticeDetails({
            name: response.data.name,
            email: response.data.email
          });
        }

        const optometrists = response.data.optometrists || [];

        const mappedPractitioners = optometrists.map(opt => {
          // Process calendar_time_slots_unavailable
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
            calendar_time_slots_unavailable: opt.calendar_time_slots_unavailable // Keep original for reference
          };
        });

        setPractitioners(mappedPractitioners);
        setError(null);
      } catch (error) {
        console.error('Error fetching practitioners:', error);
        setError('Failed to load practitioners. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPractitioners();
  }, [practiceId]);


  const [formData, setFormData] = useState({
    appointmentType: "",
    name: "",
    email: "",
    mobile: "",
    comments: "",
    date: "",
    timeSlot: "",
    practitioner: "",
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState(null);
  const [selectedPractitioner, setSelectedPractitioner] = useState(null);

  useEffect(() => {
    if (siteSettings) {
      setLoading(false);
    } else {
      setError('Error loading site settings');
    }
  }, [siteSettings]);

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dateValidationError, setDateValidationError] = useState('');

  const displayErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'practitioner' && value) {
      setDateValidationError('');
    }

    if (name === 'date' && value && !formData.practitioner) {
      setDateValidationError('Please select a Practitioner before selecting a date');
    } else if (name === 'date') {
      setDateValidationError('');
    }

    setFormData({ ...formData, [name]: value });

    if (name === 'date' && value && formData.practitioner) {
      fetchAvailableSlots(value, formData.practitioner);
    }
  };

  const handlePractitionerChange = (e) => {
    const practitionerId = e.target.value;
    const selected = practitioners.find(p => p.value.toString() === practitionerId);
    setSelectedPractitioner(selected);
    setFormData({ ...formData, practitioner: practitionerId });

    // Clear date validation error when practitioner is selected
    setDateValidationError('');

    // If date is already selected, fetch available slots
    if (formData.date) {
      fetchAvailableSlots(formData.date, practitionerId);
    }
  };

  // Helper function to parse unavailable time slots
  const parseUnavailableSlots = (unavailableString, selectedDate) => {
    if (!unavailableString) return [];

    const dayOfWeek = new Date(selectedDate).getDay(); // 0 = Sunday, 1 = Monday, etc.
    const unavailableSlots = [];

    const rules = unavailableString.split(';');

    rules.forEach(rule => {
      if (rule.endsWith('-Closed')) {
        const day = parseInt(rule.split('-')[0]);
        if (day === dayOfWeek) {
          unavailableSlots.push({ allDay: true });
        }
      }
      else if (rule.includes('-') && rule.includes('|')) {
        const [days, times] = rule.split('-');
        const [startTime, endTime] = times.split('-');
        const dayList = days.split('|').map(Number);

        if (dayList.includes(dayOfWeek)) {
          unavailableSlots.push({
            startTime,
            endTime
          });
        }
      }
    });

    return unavailableSlots;
  };

  const fetchAvailableSlots = async (date, practitionerId) => {
    if (!date || !practitionerId || !practiceId) {
      setAvailableSlots([]);
      return;
    }

    setIsLoadingSlots(true);
    setSlotError(null);

    try {
      // Format date to YYYY-MM-DD
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.getDay() - 1; // Convert to 0-6 (Mon-Sun) format
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const today = new Date();
      const isToday = formattedDate === today.toISOString().split('T')[0];

      // Get current time in HH:MM format for comparison
      const currentHours = String(today.getHours()).padStart(2, '0');
      const currentMinutes = String(today.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      // Get the selected practitioner's data
      const selectedPractitioner = practitioners.find(p => p.value === practitionerId);

      if (selectedPractitioner?.availability?.closedDays?.includes(dayOfWeek)) {
        setAvailableSlots([]);
        setSlotError('No availability on this day');
        return;
      }

      // Get available slots from API
      const response = await axios.post(
        'https://passport.nevadacloud.com/api/v1/public/appointments/available_slots',
        {
          practice_id: practiceId,
          practitioner_id: practitionerId,
          appointment_date: formattedDate
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && Array.isArray(response.data)) {
        // Filter out unavailable slots based on calendar_time_slots_unavailable
        const unavailableSlots = [];

        // Add unavailable time slots for this day
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

        const filteredSlots = response.data.map(slot => {
          // First check if the slot is marked as unavailable in the API response
          if (!slot.available) {
            return {
              ...slot,
              available: false
            };
          }

          // Then check for unavailable time slots from practitioner's calendar
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
      } else {
        setAvailableSlots([]);
        setSlotError('No availability data received');
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setSlotError('Failed to load available time slots. Please try again.');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

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
      formDataToSend.append('appointment[practitioner_id]', formData.practitioner || '');
      formDataToSend.append('appointment[status]', 'requested');
      formDataToSend.append('appointment[source]', 'lumina');

      formDataToSend.append('practice[id]', practiceId);
      formDataToSend.append('practice[name]', apiPracticeDetails.name || siteSettings?.practiceName || 'Image Eye Care');
      formDataToSend.append('practice[email]', apiPracticeDetails.email || siteSettings?.contactEmail || 'support@nevadacloud.com');

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
      if (actionVerb === 'book' && formData.timeSlot) {
        const appointmentDate = new Date(formData.date);
        const [hours, minutes] = formData.timeSlot.split(':');
        startTime = new Date(appointmentDate);
        startTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);
        startTime = startTime.toISOString();
        endTime = endTime.toISOString();
      }

      let timezoneOffset = 0;
      let timezoneString = '+00:00';
      if (actionVerb === 'book' && startTime) {
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
      formDataToSend.append('appointment[appt_type]', 'consult');
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

      formDataToSend.append('practice[id]', practiceId);
      formDataToSend.append('practice[name]', apiPracticeDetails.name || siteSettings?.practiceName || 'Image Eye Care');
      formDataToSend.append('practice[email]', apiPracticeDetails.email || siteSettings?.contactEmail || 'support@nevadacloud.com');

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
          appointmentType: "",
          name: "",
          email: "",
          mobile: "",
          comments: "",
          date: "",
          timeSlot: "",
          practitioner: "",
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

  // Custom Booking URL Overlay Component
  const CustomBookingOverlay = () => {
    if (!customBookingUrl) return null;

    const handleOverlayClick = () => {
      window.location.href = customBookingUrl;
    };

    return (
      <div
        className="absolute inset-0 z-50 cursor-pointer"
        onClick={handleOverlayClick}
        style={{ background: 'transparent' }}
      />
    );
  };

  const primaryColor = siteSettings?.primaryColor || '#0ea5e9';

  return (
    <div className="min-h-screen relative" style={{ background: primaryColor }}>
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1586767003407-8fb8ba84b5df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
            backgroundAttachment: 'fixed',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.4
          }}
        ></div>
        <div className="absolute inset-0 bg-white/60"></div>
      </div>
      <div className="container mx-auto py-8" id="booking">
        {/* Success Modal */}
        {showSuccessModal && (
          <SuccessModal onClose={() => setShowSuccessModal(false)} />
        )}

        <section id="booking" className="section cta pt-0 pb-0">
          <div className="flex flex-col lg:flex-row bg-white rounded-lg shadow-md overflow-hidden" style={{ minHeight: "800px" }}>
            {/* Contact Information Card - Full width on mobile, left side on desktop */}
            <div className="lg:order-1 order-2 lg:w-1/2 lg:flex lg:flex-col">
              {/* Map - Full width on mobile, fixed height on desktop */}
              <div className="h-64 lg:h-1/2">
                <iframe
                  src={`https://maps.google.com/maps?q=${siteSettings.address_1}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                ></iframe>
              </div>

              {/* Contact Info - Scrollable area below map */}
              <div className="p-6 lg:overflow-y-auto lg:h-1/2">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <h5 className="text-xl font-medium text-primary mb-2">Physical Address</h5>
                    <p className="text-gray-600">{siteSettings.address_1}</p>
                  </div>

                  <div>
                    <h5 className="text-xl font-medium text-primary mb-2">Trading Hours</h5>
                    <ul className="space-y-1">
                      {(() => {
                        if (!siteSettings.hours || typeof siteSettings.hours !== 'string') {
                          return <li className="text-gray-600">No trading hours available</li>;
                        }

                        try {
                          // Parse the hours string
                          const hoursEntries = siteSettings.hours.split(';').filter(Boolean);
                          const daysMap = {
                            '0': 'Monday',
                            '1': 'Tuesday',
                            '2': 'Wednesday',
                            '3': 'Thursday',
                            '4': 'Friday',
                            '5': 'Saturday',
                            '6': 'Sunday',
                            '7': 'Public Holidays'
                          };

                          // Group consecutive days with same hours
                          const groupedHours = [];
                          let currentGroup = null;

                          hoursEntries.forEach(entry => {
                            const [days, start, end] = entry.split('-');
                            if (!days || !start || !end) return;

                            const dayNumbers = days.split('|');
                            const dayNames = dayNumbers.map(day => daysMap[day] || day);

                            // Format time in 24-hour format
                            const formatTime = (time24) => {
                              // Just return the time as-is since it's already in 24h format
                              return time24;
                            };

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
                            // Check for weekdays (Mon-Fri)
                            const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                            if (days.every(day => weekdays.includes(day)) && days.length === 5) {
                              return 'Monday - Friday';
                            }
                            // Check for Mon-Thu
                            const weekdaysMinusFriday = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
                            if (days.every(day => weekdaysMinusFriday.includes(day)) && days.length === 4) {
                              return 'Monday - Thursday';
                            }
                            // For other cases, list all days
                            return days.join(', ');
                          };

                          return groupedHours.map((group, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="text-gray-600">{formatDayRange(group.days)}:</span>
                              <span className="text-gray-800 font-medium">{group.time}</span>
                            </li>
                          ));
                        } catch (error) {
                          console.error('Error parsing working hours:', error);
                          return <li className="text-gray-600">Error loading trading hours</li>;
                        }
                      })()}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-xl font-medium text-primary mb-2">Contact Details</h5>
                    <ul className="space-y-1">
                      <li className="text-gray-600 flex items-center gap-2">
                        <FaPhone className="w-4 h-4 text-primary" />
                        <a href={`tel:${siteSettings.tel}`} className="text-gray-600 hover:text-primary">{siteSettings.tel}</a>
                      </li>
                      <li className="text-gray-600 flex items-center gap-2">
                        <FaEnvelope className="w-4 h-4 text-primary" />
                        <a href={`mailto:${siteSettings.email}`} className="text-gray-600 hover:text-primary">{siteSettings.email}</a>
                      </li>
                      {siteSettings.whatsapp_tel && (
                        <li className="text-gray-600 flex items-center gap-2">
                          <FaWhatsapp className="w-4 h-4 text-primary" />
                          <a
                            href={`https://wa.me/${siteSettings.whatsapp_tel.replace(/\D/g, '')}`}
                            className="text-gray-600 hover:text-primary"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {siteSettings.whatsapp_tel}
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form - Full width on mobile, right side on desktop */}
            <div className="lg:order-2 order-1 lg:w-1/2 p-6 lg:p-8 relative overflow-hidden">
              {/* Custom Booking URL Overlay */}
              <CustomBookingOverlay />
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 -z-10">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
                    backgroundAttachment: 'fixed',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.15
                  }}
                ></div>
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
              </div>
              <h3 id="book_appointment" className="text-3xl lg:text-4xl mb-6 font-bold text-center text-gray-800">
                <span className="text-primary">{actionVerbTitle}</span> Your Appointment
              </h3>
              <div className="w-20 h-1 bg-primary mx-auto mb-5"></div>
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-lg p-6 w-full max-w-2xl mx-auto"
                id="booking_form"
                name="booking_form"
              >
                <div className="mb-6">
                  <select
                    id="appt_type"
                    name="appointmentType"
                    value={formData.appointmentType}
                    onChange={handleInputChange}
                    className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white transition duration-200"
                  >
                    <option disabled value="" className="text-gray-400">Select appointment type</option>
                    <option value="consult" className="text-gray-800">Full examination</option>
                    <option value="drivers" className="text-gray-800">Driver&apos;s screening</option>
                  </select>
                </div>

                {formData.appointmentType === 'drivers' ? (
                  <div className="text-center py-8">
                    <p className="text-orange-500 text-xl font-medium">
                      Please call us directly to make a driver&apos;s screening appointment.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-5">
                      <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-600 transition duration-200"
                      />
                    </div>

                    <div className="mb-5">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-600 transition duration-200"
                      />
                    </div>

                    <div className="mb-4">
                      <div className="relative">
                        <PhoneInput
                          international
                          defaultCountry="ZA"
                          value={formData.mobile}
                          onChange={(value) => setFormData({ ...formData, mobile: value })}
                          className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white transition duration-200"
                          placeholder="Contact Number"
                          required
                        />
                      </div>
                    </div>

                    <textarea
                      name="comments"
                      placeholder="Additional Comments"
                      value={formData.comments}
                      onChange={handleInputChange}
                      className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-600 transition duration-200"
                      rows="4"
                    />

                    {actionVerb === 'book' && (
                      <div className="mb-5">
                        <div className="mb-5">
                          <select
                            id="practitioner"
                            name="practitioner"
                            value={formData.practitioner || ''}
                            onChange={handlePractitionerChange}
                            className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white transition duration-200"
                            required
                            disabled={loading || practitioners.length === 0}
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
                          {loading && <p className="mt-1 text-sm text-gray-500">Loading practitioners...</p>}
                          {!loading && practitioners.length === 0 && !error && (
                            <p className="mt-1 text-sm text-yellow-600">No practitioners found for this practice</p>
                          )}
                          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                        </div>

                        <div className="mb-5">
                          <DatePicker
                            selected={formData.date ? new Date(formData.date) : null}
                            onChange={(date) => {
                              const formattedDate = date ? date.toISOString().split('T')[0] : '';
                              handleInputChange({ target: { name: 'date', value: formattedDate } });
                            }}
                            minDate={new Date()}
                            placeholderText="Select appointment date"
                            wrapperClassName="w-full"
                            className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-600 bg-white transition duration-200"
                            required
                            dateFormat="yyyy-MM-dd"
                            isClearable={false}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                          />
                        </div>

                        {dateValidationError && (
                          <div className="mb-5 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {dateValidationError}
                          </div>
                        )}

                        {formData.date && formData.practitioner && (
                          <div className="mt-5">
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
                                    className={`p-3.5 border rounded-md text-center transition-colors duration-200 ${slot.available
                                        ? formData.timeSlot === slot.time
                                          ? 'bg-primary text-white border-primary hover:bg-primary-dark'
                                          : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 hover:border-primary'
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
                      <div className="mb-5">
                        <DatePicker
                          selected={formData.date ? new Date(formData.date) : null}
                          onChange={(date) => {
                            const formattedDate = date ? date.toISOString().split('T')[0] : '';
                            handleInputChange({ target: { name: 'date', value: formattedDate } });
                          }}
                          minDate={new Date()}
                          placeholderText="Select appointment date"
                          wrapperClassName="w-full"
                          className="w-full p-3.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-600 bg-white transition duration-200"
                          dateFormat="yyyy-MM-dd"
                          isClearable={false}
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                        />
                      </div>
                    )}

                    {/* Success Message */}
                    {showSuccessMessage && (
                      <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        {actionVerb === 'book' ? 'Your appointment has been scheduled successfully!' : 'Your appointment has been requested successfully!'}
                      </div>
                    )}

                    {showError && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{errorMessage}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                      <button
                        id="booking_call_me"
                        type="button"
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors duration-200 font-medium"
                        onClick={handleRequestCall}
                      >
                        Request Call
                      </button>
                      <button
                        id="booking_button"
                        type="submit"
                        className="px-6 py-3 bg-black text-white rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 font-medium"
                      >
                        {actionVerbTitle} Appointment
                      </button>
                    </div>
                  </>
                )}
              </form>
              <div className="box mt-8">

              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookingPage;