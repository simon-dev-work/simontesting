import InfoCentreListPage from '../../../../../app/pages/InfoCentreListPage';
import { SiteSettingsProvider } from '../../../../../app/context/SiteSettingsContext';
import SinglePageNavbar from '../../../../../app/components/SinglePageNavbar';
import SinglePageFooter from '../../../../../app/components/SinglePageFooter';

export const dynamic = 'force-dynamic';

async function fetchPracticeLogos(practiceId) {
  if (!practiceId) {
    return { logoLight: null, logoDark: null };
  }

  try {
    const response = await fetch(`https://eyecareportal.herokuapp.com/api/website/${practiceId}/0`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return { logoLight: null, logoDark: null };
    }

    const data = await response.json();
    let logoLight = null;
    let logoDark = null;

    if (data?.about) {
      logoLight = data.about.logo_light || data.about.logo_dark || null;
      logoDark = data.about.logo_dark || data.about.logo_light || null;
    } else if (Array.isArray(data)) {
      logoLight = data.find(s => s.setting_name === 'PracticeLogoURL')?.setting_value || null;
      logoDark = data.find(s => s.setting_name === 'PracticeLogoDarkURL')?.setting_value || null;
    } else if (data && typeof data === 'object') {
      logoLight = data.logo_light || data.PracticeLogoURL || data.practice_logo_url || null;
      logoDark = data.logo_dark || data.PracticeLogoDarkURL || data.practice_logo_dark_url || null;
    }

    return {
      logoLight: logoLight || logoDark,
      logoDark: logoDark || logoLight
    };
  } catch (error) {
    console.error('Error fetching practice logos:', error);
    return { logoLight: null, logoDark: null };
  }
}

export default async function InfoCentreListRoute({ params }) {
  // Extract both id (category) and practiceId from params
  const { id, practiceId } = await Promise.resolve(params);

  const practiceLogo = await fetchPracticeLogos(practiceId);
  
  return (
    <SiteSettingsProvider initialPracticeId={practiceId}>
      <div className="flex flex-col min-h-screen">
        <SinglePageNavbar 
          practiceId={practiceId}
          logoLight={practiceLogo.logoLight}
          logoDark={practiceLogo.logoDark}
        />
        <main className="flex-grow">
          <InfoCentreListPage category={id} practiceId={practiceId} />
        </main>
        <SinglePageFooter 
          practiceId={practiceId}
          logoLight={practiceLogo.logoLight}
          logoDark={practiceLogo.logoDark}
        />
      </div>
    </SiteSettingsProvider>
  );
}
