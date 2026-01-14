import crypto from 'crypto';

function getDailyKey() {
    const today = new Date().toISOString().split("T")[0];
    return crypto.createHash("md5").update(today).digest("hex");
}

export async function resolvePracticeIdFromHost(hostname) {
    if (!hostname) return null;

    // Remove port if present
    const cleanHostname = hostname.split(':')[0].toLowerCase();

    const domainsToTry = [cleanHostname];
    if (cleanHostname.startsWith('www.')) {
        domainsToTry.push(cleanHostname.replace('www.', ''));
    } else {
        domainsToTry.push(`www.${cleanHostname}`);
    }

    // 1. Try the new domain_lookup API
    try {
        const todayKey = getDailyKey();

        for (const domain of domainsToTry) {
            const response = await fetch('https://eyecareportal.herokuapp.com/api/domain_lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    today_key: todayKey,
                    domain: domain
                }),
                // Use a reasonable timeout
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const data = await response.json();
                const identifier = data.practice_id || data.id || data.customer_code;
                if (identifier) {
                    return identifier.toString();
                }
            }
        }
    } catch (error) {
        console.error('Error resolving practice by domain_lookup API:', error);
    }

    // 2. Fallback to the old passport API
    try {
        for (const domain of domainsToTry) {
            const response = await fetch(
                `https://passport.nevadacloud.com/api/v1/public/practice_by_domain?domain=${encodeURIComponent(domain)}`,
                { signal: AbortSignal.timeout(3000) }
            );

            if (response.ok) {
                const data = await response.json();
                if (data && (data.customer_code || data.id)) {
                    return data.customer_code || data.id.toString();
                }
            }
        }
    } catch (error) {
        console.error('Error resolving practice by old passport API:', error);
    }

    return null;
}
