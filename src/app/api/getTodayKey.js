import md5 from 'md5';

const getTodayKey = () => {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  return md5(formattedDate);
};

export default getTodayKey;
