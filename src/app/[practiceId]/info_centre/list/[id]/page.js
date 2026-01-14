import InfoCentreListPage from '../../../../pages/InfoCentreListPage';

export const dynamic = 'force-dynamic';

export default async function PracticeInfoCentreListPage({ params }) {
  // Destructure params in an async context
  const { id } = await Promise.resolve(params);
  
  return <InfoCentreListPage category={id} />;
}
