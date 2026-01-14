export async function GET() {
  return new Response(JSON.stringify('OK'), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
