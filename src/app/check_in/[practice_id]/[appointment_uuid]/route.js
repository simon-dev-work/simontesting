import { NextResponse } from 'next/server';
import axios from 'axios';

const PASSPORT_API_URL = 'https://passport.nevadacloud.com/api/v1';
const PASSPORT_PUBLIC_URL = 'https://eyecareportal.herokuapp.com';

async function getPracticeDetails(practiceId) {
  const response = await axios.get(`${PASSPORT_API_URL}/public/practices/${practiceId}`);
  return response.data;
}

async function markCheckInComplete(practiceId, appointmentUuid, apiKey) {
  try {
    await axios.post(
      `${PASSPORT_API_URL}/public/appointments/check_in_completed`,
      {
        api_key: apiKey,
        practice_id: practiceId,
        appointment_uuid: appointmentUuid
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error marking check-in as complete:', error);
    // Continue even if this fails
  }
}

export async function GET(request, context) {
  try {
    const { params } = context;
    const practice_id = params.practice_id;
    const appointment_uuid = params.appointment_uuid;

    if (!practice_id || !appointment_uuid) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Get practice details
    const practice = await getPracticeDetails(practice_id);
    
    if (!practice) {
      return new NextResponse('Practice not found', { status: 404 });
    }

    let redirectUrl;
    const checkInType = practice.appointment_check_in_type || 'enabled';
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const todayKey = process.env.TODAY_KEY; // Make sure to set this in your environment variables

    switch (checkInType) {
      case 'disabled':
        // If check-in is disabled, redirect to practice website
        redirectUrl = practice.website || `${PASSPORT_PUBLIC_URL}`;
        break;

      case 'custom_single':
        // Use custom check-in URL and mark as checked in
        if (practice.custom_check_in_link_url) {
          redirectUrl = practice.custom_check_in_link_url;
          // Mark check-in as complete in the background
          markCheckInComplete(practice_id, appointment_uuid, todayKey);
        }
        break;

      case 'custom_confirm':
        // Use custom check-in URL without marking as checked in
        redirectUrl = practice.custom_check_in_link_url || `${PASSPORT_PUBLIC_URL}/appointments/check_in/${appointment_uuid}`;
        break;

      case 'enabled':
      default:
        // Default to standard check-in flow
        redirectUrl = `${PASSPORT_PUBLIC_URL}/appointments/check_in/${appointment_uuid}`;
        break;
    }

    // If we don't have a valid URL by now, use a fallback
    if (!redirectUrl) {
      redirectUrl = `${PASSPORT_PUBLIC_URL}/appointments/check_in/${appointment_uuid}`;
    }

    // Ensure the URL has a protocol
    if (!redirectUrl.startsWith('http')) {
      redirectUrl = `https://${redirectUrl}`;
    }

    return NextResponse.redirect(redirectUrl, 307);

  } catch (error) {
    console.error('Error in check-in route:', error);
    // Fallback to standard check-in URL in case of errors
    const fallbackUrl = `${PASSPORT_PUBLIC_URL}/appointments/check_in/${context?.params?.appointment_uuid || ''}`;
    return NextResponse.redirect(fallbackUrl, 307);
  }
}
