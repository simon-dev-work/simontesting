// Backend API base URL - should be moved to environment variables in production
const BACKEND_API_URL = 'https://passport.nevadacloud.com';

export async function getPracticeByCode(customerCode) {
  // Validate customer code format
  if (!customerCode || typeof customerCode !== 'string' || customerCode.trim() === '') {
    throw new Error('Invalid customer code format');
  }

  // Convert customer code to uppercase for case-insensitive matching
  const normalizedCustomerCode = customerCode.toUpperCase().trim();

  // Call the backend API to get practice by customer code (case-insensitive)
  const response = await fetch(
    `${BACKEND_API_URL}/api/v1/public/practice_by_customer_code?customer_code=${encodeURIComponent(normalizedCustomerCode)}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Add a timeout to prevent hanging
      signal: AbortSignal.timeout(5000)
    }
  );

  if (!response.ok) {
    // If practice not found, throw error
    if (response.status === 404) {
      throw new Error('Practice not found');
    }
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data;
}
