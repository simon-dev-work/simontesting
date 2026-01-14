import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { date, appointment_type } = await request.json();
    
    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    if (!appointment_type) {
      return NextResponse.json(
        { error: 'Appointment type is required' },
        { status: 400 }
      );
    }

    // Format date to YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split('T')[0];

    // Make the API call to the external service
    const response = await fetch('https://passport.nevadacloud.com/api/v1/public/appointments/available_slots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add any required authentication headers here
        // 'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        date: formattedDate,
        practice_id: '1',
        appointment_type,
        // Add other required parameters here
        // doctor_id: '1'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('External API Error:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch available slots' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
