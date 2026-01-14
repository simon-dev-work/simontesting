import { NextResponse } from 'next/server';
import axios from 'axios';

async function checkDatabase() {
  try {
    // Add your database health check logic here
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

async function checkExternalApis() {
  const apis = [
    'https://passport.nevadacloud.com/api/v1/public/health',
    'https://eyecareportal.herokuapp.com/api/health'
  ];

  const results = await Promise.allSettled(
    apis.map(url => 
      axios.get(url, { timeout: 5000 })
        .then(res => ({
          url,
          status: res.status === 200 ? 'ok' : 'error',
          statusCode: res.status
        }))
        .catch(error => ({
          url,
          status: 'error',
          error: error.message,
          statusCode: error.response?.status || 0
        }))
    )
  );

  return {
    status: results.every(r => r.status === 'fulfilled' && r.value.status === 'ok') ? 'ok' : 'error',
    endpoints: results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
  };
}

export async function GET() {
  try {
    const [database, externalApis] = await Promise.all([
      checkDatabase(),
      checkExternalApis()
    ]);

    const isHealthy = database.status === 'ok' && 
                     externalApis.status === 'ok';

    return new NextResponse(JSON.stringify({
      status: isHealthy ? 'ok' : 'error',
      database,
      externalApis,
      timestamp: new Date().toISOString(),
    }), {
      status: isHealthy ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
