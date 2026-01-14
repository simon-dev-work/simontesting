import { NextResponse } from 'next/server';

export async function GET(request, context) {
  try {
    const practiceId = context.params?.practiceId;
    
    if (!practiceId) {
      return NextResponse.json(
        { error: 'Practice ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://eyecareportal.herokuapp.com/api/website/${practiceId}/0`);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch data from external API' },
        { status: response.status }
      );
    }

    const response2 = await fetch(`https://passport.nevadacloud.com/api/v1/practice`);
    if (!response2.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch data from external API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching practice data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}