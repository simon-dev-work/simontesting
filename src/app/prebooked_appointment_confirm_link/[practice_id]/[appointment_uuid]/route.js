import { NextResponse } from 'next/server';
import crypto from 'crypto';

function getApiKey() {
  const today = new Date().toISOString().split('T')[0];
  return crypto.createHash('md5').update(today).digest('hex');
}

function formatAppointmentDate(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  return new Date(dateString).toLocaleDateString('en-US', options)
    .replace(/(\d+)(?=:)/, (match) => match.padStart(2, '0')); // Ensure 2-digit hour
}

export async function GET(request, { params }) {
  const { practice_id, appointment_uuid } = params;
  const apiKey = getApiKey();
  
  try {
    // Fetch appointment details from Nevada Cloud API
    const response = await fetch(
      `https://passport.nevadacloud.com/api/v1/public/appointments/${appointment_uuid}?api_key=${apiKey}&practice_id=${practice_id}`,
      { next: { revalidate: 0 } } // Disable caching
    );

    if (!response.ok) {
      throw new Error('Failed to fetch appointment details');
    }

    const appointment = await response.json();
    
    // Format the appointment time
    const formattedDate = formatAppointmentDate(appointment.start_time);
    
    // Create HTML response
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Appointment Confirmation</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              color: #333;
            }
            .container {
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              padding: 20px;
              margin-top: 20px;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              margin: 10px 5px;
              background-color: #0070f3;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
            }
            .button:hover {
              background-color: #005bb5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Hi ${appointment.patient_name || 'there'},</h1>
            <p>Your appointment is scheduled for <strong>${formattedDate}</strong></p>
            
            <div style="margin-top: 30px;">
              <p>If you would like to reschedule, please click the button below:</p>
              <a href="#" class="button">Reschedule Appointment</a>
            </div>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
    
  } catch (error) {
    console.error('Error fetching appointment:', error);
    
    // Fallback to simple error page
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <div style="max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
            <h2>Unable to load appointment details</h2>
            <p>We're sorry, but we couldn't retrieve the appointment information at this time.</p>
            <p>Please try again later or contact the practice directly for assistance.</p>
            <p style="color: #999; margin-top: 30px;">Error: ${error.message}</p>
          </div>
        </body>
      </html>
    `;
    
    return new NextResponse(errorHtml, {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
