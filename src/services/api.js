import axios from 'axios';
import { logError, trackPerformance } from '../utils/monitoring';

const API_BASE_URL = 'https://passport.nevadacloud.com/api/v1/public';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  const startTime = performance.now();
  const requestId = Math.random().toString(36).substring(2, 9);
  
  try {
    const response = await axios({
      url,
      ...options,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...options.headers,
      },
    });

    const duration = performance.now() - startTime;
    trackPerformance('api_request', duration, {
      url,
      method: options.method || 'GET',
      status: response.status,
      requestId,
    });

    return response.data;
  } catch (error) {
    const isRetryable = !error.response || 
                       (error.response.status >= 500 && error.response.status < 600);
    
    if (retries <= 0 || !isRetryable) {
      logError(error, {
        url,
        method: options.method || 'GET',
        status: error.response?.status,
        requestId,
        attempt: MAX_RETRIES - retries + 1,
      });
      throw error;
    }

    // Exponential backoff
    const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1);
    await sleep(delay);
    return fetchWithRetry(url, options, retries - 1);
  }
};

export const api = {
  getPractitioners: async (practiceId) => {
    try {
      const data = await fetchWithRetry(
        `${API_BASE_URL}/practices/${practiceId}`,
        { method: 'GET' },
        { practiceId }
      );
      return data?.optometrists || [];
    } catch (error) {
      logError(error, { practiceId, method: 'getPractitioners' });
      throw new Error('Failed to fetch practitioners. Please try again later.');
    }
  },
  
  getAvailableSlots: async (practiceId, practitionerId, date) => {
    try {
      return await fetchWithRetry(
        `${API_BASE_URL}/appointments/available_slots`,
        {
          method: 'POST',
          data: { 
            practice_id: practiceId, 
            practitioner_id: practitionerId, 
            appointment_date: date 
          }
        },
        { practiceId, practitionerId, date }
      ) || [];
    } catch (error) {
      logError(error, { 
        practiceId, 
        practitionerId, 
        date, 
        method: 'getAvailableSlots' 
      });
      throw new Error('Failed to fetch available slots. Please try again.');
    }
  },
  
  getPracticeSettings: async (practiceId) => {
    try {
      return await fetchWithRetry(
        `https://www.ocumail.com/api/settings?setting_object_id=${practiceId}&setting_object_type=Practice`,
        { method: 'GET' },
        { practiceId }
      ) || [];
    } catch (error) {
      logError(error, { practiceId, method: 'getPracticeSettings' });
      return []; // Return empty array as fallback
    }
  },
  
  getPracticeData: async (practiceId) => {
    try {
      return await fetchWithRetry(
        `https://eyecareportal.herokuapp.com/api/website/${practiceId}/0`,
        { method: 'GET' },
        { practiceId }
      ) || {};
    } catch (error) {
      logError(error, { practiceId, method: 'getPracticeData' });
      return {}; // Return empty object as fallback
    }
  }
};
