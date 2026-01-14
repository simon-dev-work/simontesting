import { NextResponse } from 'next/server';
import ical from 'ical-generator';
import crypto from 'crypto';

// Generate the API key based on current date (YYYY-MM-DD)
function generateApiKey() {
  const today = new Date().toISOString().split('T')[0];
  return crypto.createHash('md5').update(today).digest('hex');
}

export async function GET(request, { params }) {
  const { practice_id, appointment_uuid } = params;
  const baseUrl = 'https://passport.nevadacloud.com';
  
  try {
    // 1. Fetch practice data from Passport API
    const practiceResponse = await fetch(
      `${baseUrl}/api/v1/public/practices/${practice_id}`,
      { cache: 'no-store' }
    );

    if (!practiceResponse.ok) {
      return new NextResponse(JSON.stringify({ error: 'Practice not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const practiceInfo = await practiceResponse.json();
    
    // 2. Generate API key for today
    const apiKey = generateApiKey();
    
    // 3. Fetch appointment details using the authenticated endpoint
    const appointmentResponse = await fetch(
      `${baseUrl}/api/v1/public/appointments/${appointment_uuid}?api_key=${apiKey}&practice_id=${practice_id}`,
      { 
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!appointmentResponse.ok) {
      return new NextResponse(JSON.stringify({ 
        error: 'Appointment not found or not available for rescheduling' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const appointmentInfo = await appointmentResponse.json();

    // 3. Create iCalendar event
    const calendar = ical({ name: 'Appointment' });
    
    // Convert times to local timezone (adjust timezone as needed)
    const timeZone = appointmentInfo.request_timezone || 'UTC';
    const startTime = new Date(appointmentInfo.start_time);
    const endTime = new Date(appointmentInfo.end_time);
    
    // Format the summary and description
    const summary = `${practiceInfo.name} appointment: ${startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })} on ${startTime.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;

    // Create description with patient details if available
    const description = [
      summary,
      appointmentInfo.patient_name ? `Patient: ${appointmentInfo.patient_name}` : '',
      appointmentInfo.patient_phone_number ? `Phone: ${appointmentInfo.patient_phone_number}` : ''
    ].filter(Boolean).join('\n');

    // Add event to calendar
    calendar.createEvent({
      start: startTime,
      end: endTime,
      summary: summary,
      description: description,
      location: practiceInfo.address_1 || '',
      organizer: {
        name: practiceInfo.name,
        email: practiceInfo.email || practiceInfo.contact_email || ''
      },
      timezone: timeZone
    });

    // 4. Create the response with the iCalendar file
    const icsContent = calendar.toString();
    
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${practiceInfo.name.replace(/[^\w\s]/gi, '')} appointment.ics"`
      }
    });
    
  } catch (error) {
    console.error('Error generating calendar file:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to generate calendar file' }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}