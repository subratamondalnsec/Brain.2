import api from './auth';

export const sendTextEntry = async (text) => {
  const response = await api.post('/chat/entry/text', { text });
  return response.data;
};

export const sendImageEntry = async (file, caption = '') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('caption', caption);

  const response = await api.post('/chat/entry/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/chat/history');
  return response.data;
};

export const getChatByDate = async (date) => {
  const response = await api.get(`/chat/${date}`);
  return response.data;
};
