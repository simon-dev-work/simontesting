import axios from 'axios';

export const isLuminaPractice = async (practiceId) => {
  try {
    const response = await axios.get(`https://eyecareportal.herokuapp.com/api/website/${practiceId}/0`);
    // If the response is an empty object, it's not a Lumina practice
    return Object.keys(response.data).length > 0;
  } catch (error) {
    console.error('Error checking if practice is Lumina:', error);
    return false;
  }
};

export const getPracticeSettings = async (practiceId) => {
  try {
    const response = await axios.get(
      `https://www.ocumail.com/api/settings?setting_object_id=${practiceId}&setting_object_type=Practice`
    );
    return response.data || [];
  } catch (error) {
    console.error('Error fetching practice settings:', error);
    return [];
  }
};

export const getPracticeLogo = (settings) => {
  const logoSetting = settings.find(
    setting => setting.setting_name === 'PracticeLogoURL' && setting.setting_value
  );
  return logoSetting ? logoSetting.setting_value : null;
};
