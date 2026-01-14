import { NextResponse } from "next/server";

// Default response when license check fails
const DEFAULT_RESPONSE = {
  hasLumina: false,
  product_type: null,
  expiry_date: null
};

export async function GET(request, { params }) {
  try {
    // Safely get practiceId from params
    const { practiceId } = await Promise.resolve(params);
    
    if (!practiceId) {
      console.warn("No practiceId provided to check_licence endpoint");
      return NextResponse.json(DEFAULT_RESPONSE, { status: 200 });
    }

    let licenseData;
    try {
      const licenseResponse = await fetch(
        `https://passport.nevadacloud.com/api/v1/public/get_licence_names?practice_id=${practiceId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          // Add a timeout to prevent hanging
          signal: AbortSignal.timeout(5000)
        }
      );

      if (!licenseResponse.ok) {
        // For 404 or other errors, return default response instead of failing
        if (licenseResponse.status === 404) {
          console.warn(`No license found for practice ${practiceId}`);
          return NextResponse.json(DEFAULT_RESPONSE, { status: 200 });
        }
        throw new Error(`License API responded with status: ${licenseResponse.status}`);
      }

      licenseData = await licenseResponse.json();
    } catch (error) {
      // Log the error but don't fail the request
      console.warn(`Error fetching license for practice ${practiceId}:`, error.message);
      return NextResponse.json(DEFAULT_RESPONSE, { status: 200 });
    }

    // Safely process the license data
    try {
      const licensesArray = Array.isArray(licenseData) 
        ? licenseData 
        : licenseData?.licenses || [];

      const lumina = licensesArray.find((lic) =>
        lic?.description?.toLowerCase().includes("lumina blue")
      ) || null;

      return NextResponse.json({
        hasLumina: Boolean(lumina),
        product_type: lumina?.product_type || null,
        expiry_date: lumina?.expiry_date || null,
      });
    } catch (error) {
      console.warn(`Error processing license data for practice ${practiceId}:`, error);
      return NextResponse.json(DEFAULT_RESPONSE, { status: 200 });
    }
  } catch (error) {
    // Catch any unexpected errors and return default response
    console.error("[License API] Unexpected error:", error);
    return NextResponse.json(DEFAULT_RESPONSE, { status: 200 });
  }
}
