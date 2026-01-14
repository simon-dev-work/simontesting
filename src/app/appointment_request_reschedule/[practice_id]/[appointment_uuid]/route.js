import { NextResponse } from 'next/server';
import axios from 'axios';

const PASSPORT_API_URL = 'https://passport.nevadacloud.com/api/v1';
const OCUMAIL_API_URL = 'https://www.ocumail.com/api';

export async function GET(request, context) {
  try {
    const { params } = context;
    const practice_id = params.practice_id;
    const appointment_uuid = params.appointment_uuid;

    if (!practice_id || !appointment_uuid) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // 1. Get practice details
    const practiceResponse = await axios.get(`${PASSPORT_API_URL}/public/practices/${practice_id}`);
    const practice = practiceResponse.data;
    
    if (!practice) {
      return new NextResponse('Practice not found', { status: 404 });
    }

    // 2. Get appointment details with API key
    const appointmentResponse = await axios.get(`${PASSPORT_API_URL}/public/appointments/${appointment_uuid}`, {
      params: { 
        practice_id: practice_id,
        api_key: process.env.TODAY_KEY
      }
    });
    const appointment = appointmentResponse.data;

    // 3. Check appointment status
    const validStatuses = ['booked', 'confirmed', 'requested', 'reschedule', 'cancelled'];
    if (!validStatuses.includes(appointment?.status)) {
      return new NextResponse(
        JSON.stringify({ 
          error: `Appointment is ${appointment?.status || 'not found'} and cannot be rescheduled`
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let redirectUrl;
    const todayKey = process.env.TODAY_KEY;
    const notificationTriggerUrl = `${OCUMAIL_API_URL}/practice_appointment_reschedule_trigger`;

    if (practice.custom_booking_url) {
      redirectUrl = practice.custom_booking_url;

      if (appointment_uuid !== 'preview_only') {
        const appointmentDate = appointment.start_time 
          ? new Date(appointment.start_time).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
          : 'N/A';
        
        const appointmentTime = appointment.start_time 
          ? new Date(appointment.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : 'N/A';

        await axios.post(notificationTriggerUrl, {
          api_key: todayKey,
          practice_id: practice_id,
          patient_id: appointment.patient_id,
          patient_name: appointment.patient_name,
          patient_email: appointment.patient_email,
          patient_tel: appointment.patient_mobile,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          appointment_reason: appointment.appointment_notes || 'N/A',
          appointment_uuid: appointment_uuid,
          redirect_url: redirectUrl
        }, {
          headers: { 'Content-Type': 'application/json' }
        });

        await axios.post(
          `${PASSPORT_API_URL}/public/appointments/reschedule`,
          {
            api_key: todayKey,
            practice_id: practice_id,
            appointment_uuid: appointment_uuid
          },
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
    } 
    // Check if practice uses lumina website
    else if (practice.use_lumina_website === true) {
      redirectUrl = `${practice.website}/reschedule_appointment/${practice_id}/${appointment_uuid}`;
    } 
    // Default to eyecareportal
    else {
      redirectUrl = `https://eyecareportal.herokuapp.com/reschedule_appointment/${practice_id}/${appointment_uuid}`;
    }

    // Ensure URL has protocol
    if (redirectUrl && !redirectUrl.startsWith('http')) {
      redirectUrl = `https://${redirectUrl}`;
    }

    // Return redirect response
    return NextResponse.redirect(redirectUrl, 307);

  } catch (error) {
    console.error('Error in appointment reschedule request:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to process reschedule request',
        details: error.message 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}