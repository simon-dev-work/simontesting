import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const practiceId = searchParams.get('practice_id');

  if (!practiceId) {
    return NextResponse.json(
      { error: 'Practice ID is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch practice settings from the new endpoints
    const [websiteResponse, practiceResponse] = await Promise.all([
      fetch(`https://eyecareportal.herokuapp.com/api/website/${practiceId}/0`),
      fetch(`https://passport.nevadacloud.com/api/v1/public/practices/${practiceId}`)
    ]);

    if (!websiteResponse.ok || !practiceResponse.ok) {
      throw new Error('Failed to fetch practice settings');
    }

    const [websiteData, practiceData] = await Promise.all([
      websiteResponse.json(),
      practiceResponse.json()
    ]);

    // Combine the data from both endpoints
    const combinedData = {
      logo_light: websiteData.logo_light,
      logo_dark: websiteData.logo_dark,
      tel: practiceData.tel,
      email: practiceData.email,
      address_1: practiceData.address_1,
      ...websiteData,
      ...practiceData
    };

    return NextResponse.json(combinedData);
    
  } catch (error) {
    console.error('Error fetching practice settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practice settings' },
      { status: 500 }
    );
  }
}
