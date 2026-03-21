import api from './auth';

export const processAudio = async (formData) => {
  const response = await api.post('/analytics/process-audio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAnalytics = async (date) => {
  let url = '/analytics';
  if (date) url += `?date=${date}`;
  const response = await api.get(url);
  return response.data;
};

export const getSchedules = async () => {
  const response = await api.get('/analytics/schedules');
  return response.data;
};
