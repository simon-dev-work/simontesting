import { NextResponse } from 'next/server';
import crypto from 'crypto';

const BACKEND_API_URL = 'https://passport.nevadacloud.com';

function getDailyKey() {
    const today = new Date().toISOString().split("T")[0];
    return crypto.createHash("md5").update(today).digest("hex");
}

export async function GET(request, { params }) {
    const { domain } = await params;
    const cleanDomain = domain.toLowerCase();

    try {
        // 1. Try the new domain_lookup API
        const todayKey = getDailyKey();
        const lookupResponse = await fetch('https://eyecareportal.herokuapp.com/api/domain_lookup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                today_key: todayKey,
                domain: cleanDomain
            }),
            signal: AbortSignal.timeout(5000)
        });

        if (lookupResponse.ok) {
            const lookupData = await lookupResponse.json();
            const identifier = lookupData.practice_id || lookupData.id || lookupData.customer_code;

            if (identifier) {
                // Fetch full practice data using the identifier
                const practiceResponse = await fetch(
                    `${BACKEND_API_URL}/api/v1/public/practices/${identifier}`
                );
                if (practiceResponse.ok) {
                    const data = await practiceResponse.json();
                    return NextResponse.json(data);
                }
                // If full data fetch fails, return at least the identifier
                return NextResponse.json({ id: identifier, customer_code: lookupData.customer_code });
            }
        }

        // 3. Fallback to the old backend API
        const response = await fetch(
            `${BACKEND_API_URL}/api/v1/public/practice_by_domain?domain=${encodeURIComponent(cleanDomain)}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                signal: AbortSignal.timeout(5000)
            }
        );

        if (response.ok) {
            const data = await response.json();
            return NextResponse.json(data);
        }

        return NextResponse.json(
            { error: 'Practice not found' },
            { status: 404 }
        );

    } catch (error) {
        console.error('Error fetching practice by domain:', error);
        return NextResponse.json(
            { error: 'Failed to fetch practice information' },
            { status: 500 }
        );
    }
}
